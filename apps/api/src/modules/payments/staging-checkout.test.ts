import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, type TestContext } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import express from 'express';
import { FileBookingRepository } from '../bookings/repository.js';
import { createStagingCheckout } from './staging-checkout.js';
import { createStagingCheckoutWebhooks } from './staging-checkout-webhooks.js';
import type { IdentityVerifier } from '../../auth/middleware/authenticate.js';

async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), 'lvtp-checkout-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const path = join(root, 'bookings.json');
  async function setRide(status: string) {
    await writeFile(path, JSON.stringify({ bookings: [{
      id: 'ride', referenceCode: '12345', status, customerId: 'customer', customerIdentityVerified: true, fareQuote: { fareTotal: 35.25 },
    }], idempotencyIndex: {} }));
  }
  await setRide('pending');
  const verifier: IdentityVerifier = async token => {
    if (!['admin', 'finance', 'customer', 'other'].includes(token)) throw Error('Unknown fixture');
    return { userId: token, role: ['admin', 'finance'].includes(token) ? 'admin' : 'customer', status: 'active' };
  };
  type Intent = { id: string; status: string; amount: number; currency: string; amount_capturable: number; amount_received: number };
  type Session = { id: string; amount_total: number; currency: string; status: string; url: string; payment_intent?: Intent };
  const sessions: Session[] = [];
  const writes: Array<{ operation: string; key: string | null }> = [];
  const fakeStripe: typeof fetch = async (input, options) => {
    const url = new URL(String(input));
    const parts = url.pathname.split('/');
    const action = parts.at(-1);
    const json = (body: object) => Response.json({ ...body, livemode: false });
    if (options?.method === 'POST') writes.push({ operation: action ?? '', key: new Headers(options.headers).get('Idempotency-Key') });
    if (action === 'refunds') {
      const fields = options?.body as URLSearchParams;
      return json({ id: 're_' + writes.length, status: 'succeeded', amount: Number(fields.get('amount')),
        payment_intent: fields.get('payment_intent'), currency: 'eur' });
    }
    if (action === 'sessions') {
      const amount = Number((options?.body as URLSearchParams).get('line_items[0][price_data][unit_amount]'));
      const id = 'cs_test_' + (sessions.length + 1);
      const created = { id, amount_total: amount, currency: 'eur', status: 'open', url: 'https://checkout.stripe.com/c/pay/' + id };
      sessions.push(created);
      return json(created);
    }
    if (action === 'expire') {
      const session = sessions.find(item => item.id === parts.at(-2));
      assert.ok(session);
      session.status = 'expired';
      return json(session);
    }
    if (action === 'cancel' || action === 'capture') {
      const intent = sessions.find(item => item.payment_intent?.id === parts.at(-2))?.payment_intent;
      assert.ok(intent);
      assert.equal(intent.status, 'requires_capture');
      intent.status = action === 'cancel' ? 'canceled' : 'succeeded';
      intent.amount_capturable = 0;
      intent.amount_received = action === 'capture' ? intent.amount : 0;
      return json(intent);
    }
    const session = sessions.find(item => item.id === action);
    assert.ok(session);
    return json(session);
  };
  async function start(webhooks?: ReturnType<typeof createStagingCheckoutWebhooks>) {
    const app = express();
    if (webhooks) app.use(webhooks.router);
    app.use(express.json());
    app.use(createStagingCheckout(new FileBookingRepository(path), join(root, 'checkout'), 'sk_test_fixture',
      'http://localhost:43210', verifier, verifier, fakeStripe, webhooks, new Set(['finance'])));
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    return {
      origin: 'http://127.0.0.1:' + address.port,
      close: () => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }),
      async call(route: string, actor: string, body?: object) {
        const response = await fetch('http://127.0.0.1:' + address.port + route, {
          method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + actor, 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        return { status: response.status, body: await response.json().catch(() => null) };
      },
    };
  }
  return { sessions, writes, start, setRide, authorize(index: number) {
    const session = sessions[index];
    session.status = 'complete';
    session.payment_intent = { id: 'pi_' + (index + 1), status: 'requires_capture', amount: session.amount_total, currency: 'eur',
      amount_capturable: session.amount_total, amount_received: 0 };
  } };
}
const customer = '/customer/staging-checkout/ride';
const confirm = '/operations/staging-checkout/ride/confirm';
const accepts = (expectedAmountMinor: number, expectedRevision: number) => ({ expectedAmountMinor, expectedRevision });

test('staging refunds require separate finance approval and preserve the remaining balance across retries', async t => {
  const f = await fixture(t);
  const app = await f.start();
  t.after(app.close);
  await app.call(confirm, 'admin', {});
  await app.call(customer, 'customer', accepts(3525, 1));
  f.authorize(0);
  await f.setRide('completed');
  const receipt = (await app.call(customer, 'customer')).body.payment.receipt;
  const path = '/operations/staging-checkout/ride/refunds';
  const partial = { requestId: 'partial-1', amountMinor: 1000, reason: 'Partial service adjustment' };
  assert.equal((await app.call(path, 'customer', partial)).status, 403);
  assert.equal((await app.call(path, 'admin', partial)).status, 200);
  assert.equal((await app.call(path, 'admin', partial)).status, 200);
  const approve = path + '/partial-1/approve';
  assert.equal((await app.call(approve, 'admin', {})).status, 403);
  const approvals = await Promise.all([app.call(approve, 'finance', {}), app.call(approve, 'finance', {})]);
  assert.deepEqual(approvals.map(result => result.status), [200, 200]);
  assert.equal(approvals[0].body.refund.approval.by, 'finance');
  assert.equal(approvals[0].body.refund.requestedBy, 'admin');
  assert.deepEqual((await app.call(customer, 'customer')).body.payment,
    { status: 'captured', amountMinor: 3525, revision: 1, receipt, refundedMinor: 1000, netPaidMinor: 2525 });
  assert.equal((await app.call(path, 'admin', { ...partial, requestId: 'too-much', amountMinor: 2526 })).status, 409);
  assert.equal((await app.call(path, 'admin', { ...partial, requestId: 'remaining', amountMinor: 2525 })).status, 200);
  assert.equal((await app.call(path + '/remaining/approve', 'finance', {})).status, 200);
  assert.equal((await app.call(customer, 'customer')).body.payment.netPaidMinor, 0);
  assert.equal(f.writes.filter(entry => entry.operation === 'refunds').length, 2);
});

test('Checkout reconciles stored notifications in the background without a Ride return', async t => {
  const f = await fixture(t);
  const root = await mkdtemp(join(tmpdir(), 'lvtp-checkout-notification-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const secret = 'whsec_fixture';
  const webhooks = createStagingCheckoutWebhooks(root, secret);
  const app = await f.start(webhooks);
  t.after(app.close);
  assert.equal((await app.call(confirm, 'admin', {})).status, 200);
  assert.equal((await app.call(customer, 'customer', accepts(3525, 1))).status, 200);
  f.authorize(0);
  await f.setRide('completed');
  const body = JSON.stringify({ id: 'evt_complete', object: 'event', type: 'checkout.session.completed', livemode: false,
    data: { object: { id: f.sessions[0].id, object: 'checkout.session' } } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', secret).update(timestamp + '.' + body).digest('hex');
  const response = await fetch(app.origin + '/staging-checkout/webhook', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 't=' + timestamp + ',v1=' + signature },
    body,
  });
  assert.equal(response.status, 204);
  const file = join(root, 'evt_complete.json');
  const deadline = Date.now() + 8000;
  let processedAt: string | undefined;
  while (!processedAt && Date.now() < deadline) {
    processedAt = JSON.parse(await readFile(file, 'utf-8')).processedAt;
    if (!processedAt) await setTimeout(50);
  }
  assert.ok(processedAt);
  assert.deepEqual(f.writes.map(entry => entry.operation), ['sessions', 'capture']);
  const payment = await app.call(customer, 'customer');
  assert.deepEqual(payment.body.payment, { status: 'captured', amountMinor: 3525, revision: 1, receipt: 'pi_1' });
});

test('signed Checkout deliveries survive restart and retry without processing duplicate event IDs', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lvtp-webhook-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const secret = 'whsec_fixture';
  const inbox = createStagingCheckoutWebhooks(root, secret);
  const app = express();
  app.use(inbox.router);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => { server.closeAllConnections(); server.close(); });
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const { port } = address;
  async function send(id: string, type: string, signingSecret = secret, age = 0, livemode = false) {
    const body = JSON.stringify({ id, object: 'event', type, livemode,
      data: { object: { id: 'cs_test_1', object: 'checkout.session' } } });
    const timestamp = Math.floor(Date.now() / 1000) - age;
    const signature = createHmac('sha256', signingSecret).update(timestamp + '.' + body).digest('hex');
    const response = await fetch('http://127.0.0.1:' + port + '/staging-checkout/webhook', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 't=' + timestamp + ',v1=' + signature },
      body,
    });
    await response.text();
    return response.status;
  }
  assert.equal(await send('evt_b', 'checkout.session.expired'), 204);
  assert.equal(await send('evt_a', 'checkout.session.completed'), 204);
  assert.equal(await send('evt_a', 'checkout.session.completed'), 204);
  assert.equal(await send('evt_bad', 'checkout.session.completed', 'wrong'), 400);
  assert.equal(await send('evt_stale', 'checkout.session.completed', secret, 301), 400);
  assert.equal(await send('evt_live', 'checkout.session.completed', secret, 0, true), 400);
  await inbox.reconcile(async () => { throw Error('Stripe temporarily unavailable'); });
  const restarted = createStagingCheckoutWebhooks(root, secret);
  const reconciled: string[] = [];
  const processSession = async (session: string) => { reconciled.push(session); return true; };
  await restarted.reconcile(processSession);
  await restarted.reconcile(processSession);
  assert.deepEqual(reconciled, ['cs_test_1', 'cs_test_1']);
});

test('a revised fare cancels the old authorization and only captures the newly accepted amount', async t => {
  const f = await fixture(t);
  const app = await f.start();
  t.after(app.close);
  assert.equal((await app.call(confirm, 'admin', {})).body.revision, 1);
  assert.equal((await app.call(customer, 'other', accepts(3525, 1))).status, 404);
  assert.equal((await app.call(customer, 'customer', accepts(3525, 1))).status, 200);
  f.authorize(0);
  assert.equal((await app.call(confirm, 'admin', { amountMinor: 4210 })).body.revision, 2);
  assert.equal(f.sessions[0].payment_intent?.status, 'canceled');
  assert.equal((await app.call(customer, 'customer', accepts(3525, 1))).status, 409);
  assert.equal((await app.call(customer, 'customer', accepts(4210, 2))).status, 200);
  f.authorize(1);
  await f.setRide('completed');
  const receipts = await Promise.all([app.call(customer, 'customer'), app.call(customer, 'customer')]);
  assert.deepEqual(receipts.map(result => result.body.payment), Array(2).fill({ status: 'captured', amountMinor: 4210, revision: 2, receipt: 'pi_2' }));
  assert.equal(f.writes.filter(entry => entry.operation === 'capture').length, 1);
  assert.equal(f.sessions[0].payment_intent?.amount_received, 0);
});

test('cancelling an authorized ride releases Checkout once across repeated reads and a restart', async t => {
  const f = await fixture(t);
  const app = await f.start();
  try {
    assert.equal((await app.call(confirm, 'admin', {})).status, 200);
    assert.equal((await app.call(customer, 'customer', accepts(3525, 1))).status, 200);
    f.authorize(0);
    await f.setRide('cancelled');
    const released = { status: 'released', amountMinor: 3525, revision: 1 };
    const results = await Promise.all([app.call(customer, 'customer'), app.call(customer, 'customer')]);
    for (const result of results) {
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.payment, released);
    }
  } finally {
    await app.close();
  }

  const restarted = await f.start();
  t.after(restarted.close);
  const result = await restarted.call(customer, 'customer');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.payment, { status: 'released', amountMinor: 3525, revision: 1 });
  assert.equal(f.sessions[0].payment_intent?.amount_received, 0);
  assert.deepEqual(f.writes.map(entry => entry.operation), ['sessions', 'cancel']);
});

test('expired authorization requires explicit acceptance again and survives a restart', async t => {
  const f = await fixture(t);
  const initial = await f.start();
  await initial.call(confirm, 'admin', {});
  await initial.call(customer, 'customer', accepts(3525, 1));
  f.authorize(0);
  f.sessions[0].payment_intent!.status = 'canceled';
  await initial.close();
  const restarted = await f.start();
  t.after(restarted.close);
  assert.deepEqual((await restarted.call(customer, 'customer')).body.payment, { status: 'expired', amountMinor: 3525, revision: 1 });
  assert.equal(f.sessions.length, 1);
  const renewals = await Promise.all(Array.from({ length: 2 }, () => restarted.call(customer, 'customer', accepts(3525, 1))));
  assert.deepEqual(renewals.map(result => result.status).sort(), [200, 409]);
  assert.equal((await restarted.call(customer, 'customer')).body.payment.revision, 2);
  assert.equal(f.sessions.length, 2);
  assert.equal(new Set(f.writes.filter(entry => entry.operation === 'sessions').map(entry => entry.key)).size, 2);
});

test('a captured Stripe intent cannot be replaced even before booking status catches up', async t => {
  const f = await fixture(t);
  const app = await f.start();
  t.after(app.close);
  await app.call(confirm, 'admin', {});
  await app.call(customer, 'customer', accepts(3525, 1));
  f.authorize(0);
  const intent = f.sessions[0].payment_intent!;
  intent.status = 'succeeded';
  intent.amount_received = 3525;
  assert.equal((await app.call(confirm, 'admin', { amountMinor: 4000 })).status, 409);
  assert.equal((await app.call(customer, 'customer', accepts(3525, 1))).status, 409);
  assert.equal(f.sessions.length, 1);
});

test('changing the fare expires an unpaid Checkout link instead of allowing stale payment', async t => {
  const f = await fixture(t);
  const app = await f.start();
  t.after(app.close);
  await app.call(confirm, 'admin', {});
  await app.call(customer, 'customer', accepts(3525, 1));
  assert.equal((await app.call(confirm, 'admin', { amountMinor: 4000 })).body.revision, 2);
  assert.equal(f.sessions[0].status, 'expired');
  assert.equal((await app.call(customer, 'customer', accepts(4000, 1))).status, 409);
  assert.equal((await app.call(customer, 'customer', accepts(4000, 2))).status, 200);
  assert.equal(f.sessions.at(-1)?.amount_total, 4000);
});
