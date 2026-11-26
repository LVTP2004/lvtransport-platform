import { createHash } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Router } from 'express';
import { createAuthenticationMiddleware, type IdentityVerifier } from '../../auth/middleware/authenticate.js';
import type { RequestAuthContext } from '../../auth/models/request-auth-context.js';
import type { FileBookingRepository } from '../bookings/repository.js';
import type { createStagingCheckoutWebhooks } from './staging-checkout-webhooks.js';

type Refund = { id: string; amountMinor: number; reason: string; requestedBy: string; requestedAt: string;
  approval?: { by: string; at: number; intent: string }; provider?: { id: string; status: string; checkedAt: string } };
type StripeRefund = { id: string; amount: number; currency: string; payment_intent: string; status: string };
type CheckoutRecord = { id: string; amount: number; startedAt: number; session?: string; revision?: number; refunds?: Refund[];
  confirmedBy?: string; confirmedAt?: string; previous?: Array<{ revision: number; amount: number; session?: string }> };
type Intent = { id: string; status: string; amount: number; amount_received: number; amount_capturable: number; currency: string };
type Session = { id: string; url: string | null; status: string; amount_total: number; currency: string; payment_intent: Intent | null };
const terminal = new Set(['completed', 'cancelled', 'failed']);

export function createStagingCheckout(repository: FileBookingRepository, directory: string, key: string, origin: string,
  verify: IdentityVerifier, verifyCustomer: IdentityVerifier, request: typeof fetch = fetch,
  webhooks?: ReturnType<typeof createStagingCheckoutWebhooks>, refundApprovers: ReadonlySet<string> = new Set()) {
  if (!/^(sk|rk)_test_[A-Za-z0-9]+$/.test(key) || !/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    throw Error('Checkout requires a Stripe test key and a loopback origin');
  }
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const router = Router();
  const active = new Map<string, Promise<unknown>>();
  const booking = (id: string) => repository.snapshot().bookings.find(item => item.id === id);
  const digest = (id: string) => createHash('sha256').update(id).digest('hex');
  const revision = (record: CheckoutRecord) => record.revision ?? 1;
  // Keep existing provider idempotency keys for sessions created before revisions.
  const identity = (record: CheckoutRecord) => revision(record) === 1 ? record.id : record.id + ':' + revision(record);
  const path = (id: string) => join(directory, digest(id) + '.json');
  function read(id: string): CheckoutRecord | undefined {
    try { return JSON.parse(readFileSync(path(id), 'utf8')) as CheckoutRecord; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  function save(record: CheckoutRecord) {
    const temporary = path(record.id) + '.tmp';
    const fd = openSync(temporary, 'w', 0o600);
    try { writeFileSync(fd, JSON.stringify(record)); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temporary, path(record.id));
    const parent = openSync(directory, 'r');
    try { fsyncSync(parent); } finally { closeSync(parent); }
    return record;
  }
  async function serialized<T>(id: string, run: () => Promise<T>): Promise<T> {
    const task = (active.get(id) ?? Promise.resolve()).catch(() => {}).then(run);
    active.set(id, task);
    try { return await task; } finally { if (active.get(id) === task) active.delete(id); }
  }
  async function stripe<T>(endpoint: string, id: string, action: string, fields?: Record<string, string>) {
    const response = await request('https://api.stripe.com/v1' + endpoint, {
      method: fields ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Bearer ' + key, ...(fields ? {
        'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': 'lvtp-checkout-' + digest(id) + '-' + action,
      } : {}) }, body: fields ? new URLSearchParams(fields) : undefined,
    });
    if (!response.ok) throw Error('Stripe test request failed');
    const result = await response.json() as T & { livemode?: boolean };
    if (result.livemode !== false) throw Error('Expected Stripe test result');
    return result;
  }
  async function session(record: CheckoutRecord) {
    if (!record.session || !/^cs_test_[A-Za-z0-9_]+$/.test(record.session)) throw Error('Invalid Checkout session');
    const result = await stripe<Session>('/checkout/sessions/' + record.session + '?expand[]=payment_intent', record.id, 'read');
    if (result.id !== record.session || result.amount_total !== record.amount || result.currency !== 'eur') throw Error('Checkout fare mismatch');
    const intent = result.payment_intent;
    if (intent && (!/^pi_[A-Za-z0-9]+$/.test(intent.id) || intent.amount !== record.amount || intent.currency !== 'eur')) {
      throw Error('Checkout intent mismatch');
    }
    return result;
  }
  const expired = (result: Session) => result.payment_intent?.status === 'canceled'
    || (result.status === 'expired' && !result.payment_intent);
  function renewed(record: CheckoutRecord, amount: number) {
    const { session, ...rest } = record;
    return { ...rest, amount, startedAt: 0, revision: revision(record) + 1,
      previous: [...(record.previous ?? []), { revision: revision(record), amount: record.amount, session }] };
  }
  async function closeForReplacement(record: CheckoutRecord) {
    if (!record.session) return record.startedAt === 0;
    const previous = await session(record);
    if (expired(previous)) return true;
    if (previous.status === 'open') {
      const expired = await stripe<Session>('/checkout/sessions/' + previous.id + '/expire', identity(record), 'expire', {});
      return expired.id === previous.id && expired.status === 'expired';
    }
    const intent = previous.payment_intent;
    if (intent?.status !== 'requires_capture') return false;
    const canceled = await stripe<Intent>('/payment_intents/' + intent.id + '/cancel', identity(record), 'cancel', {});
    return canceled.id === intent.id && canceled.status === 'canceled';
  }
  async function view(record: CheckoutRecord) {
    const amountMinor = record.amount;
    const version = { amountMinor, revision: revision(record) };
    const ride = booking(record.id);
    if (!ride) throw Error('Checkout booking missing');
    if (!record.session) return { status: terminal.has(ride.status) ? 'released' : 'ready', ...version };
    const result = await session(record);
    const cancel = ride.status === 'cancelled' || ride.status === 'failed';
    const intent = result.payment_intent;
    if (intent?.status === 'succeeded' && intent.amount_received === amountMinor) {
      const refunds = record.refunds ?? [];
      const refundedMinor = refunds.filter(refund => refund.provider?.status === 'succeeded')
        .reduce((sum, refund) => sum + refund.amountMinor, 0);
      return { status: 'captured', ...version, receipt: intent.id,
        ...(refundedMinor > 0 ? { refundedMinor, netPaidMinor: amountMinor - refundedMinor } : {}) };
    }
    if (expired(result)) {
      return { status: terminal.has(ride.status) ? 'released' : 'expired', ...version };
    }
    if (intent?.status === 'requires_capture' && intent.amount_capturable === amountMinor) {
      if (!cancel && ride.status !== 'completed') return { status: 'authorized', ...version };
      const action = cancel ? 'cancel' : 'capture';
      const settled = await stripe<Intent>('/payment_intents/' + intent.id + '/' + action, identity(record), action,
        cancel ? {} : { amount_to_capture: String(amountMinor) });
      if (settled.id !== intent.id || settled.status !== (cancel ? 'canceled' : 'succeeded')
        || (!cancel && settled.amount_received !== amountMinor)) throw Error('Checkout settlement mismatch');
      return cancel ? { status: 'released', ...version } : { status: 'captured', ...version, receipt: settled.id };
    }
    if (result.status === 'open' && terminal.has(ride.status)) {
      const expired = await stripe<Session>('/checkout/sessions/' + result.id + '/expire', identity(record), 'expire', {});
      if (expired.status !== 'expired') throw Error('Checkout expiration mismatch');
      return { status: 'released', ...version };
    }
    return { status: result.status === 'open' ? 'ready' : 'processing', ...version };
  }
  function replaceRefund(record: CheckoutRecord, refund: Refund) {
    return save({ ...record, refunds: (record.refunds ?? []).map(item => item.id === refund.id ? refund : item) });
  }

  async function reconcileRefund(record: CheckoutRecord, refund: Refund) {
    if (!refund.approval || ['succeeded', 'failed', 'canceled'].includes(refund.provider?.status ?? '')) return refund;
    const { intent, at } = refund.approval;
    // An unknown submission must be reconciled manually once Stripe can prune its idempotency key.
    if (!refund.provider && Date.now() - at >= 23 * 60 * 60 * 1000) throw Error('Refund needs manual reconciliation');
    const key = JSON.stringify([record.id, refund.id]);
    const result = refund.provider
      ? await stripe<StripeRefund>('/refunds/' + refund.provider.id, key, 'refund')
      : await stripe<StripeRefund>('/refunds', key, 'refund', { payment_intent: intent, amount: String(refund.amountMinor) });
    if (!/^re_[A-Za-z0-9]+$/.test(result.id) || (refund.provider && result.id !== refund.provider.id)
      || result.payment_intent !== intent || result.amount !== refund.amountMinor || result.currency !== 'eur'
      || !['pending', 'requires_action', 'succeeded', 'failed', 'canceled'].includes(result.status)) {
      throw Error('Stripe refund mismatch');
    }
    const updated = { ...refund, provider: { id: result.id, status: result.status, checkedAt: new Date().toISOString() } };
    replaceRefund(record, updated);
    return updated;
  }

  const operationsAuth = createAuthenticationMiddleware(verify);
  const refundsPath = '/operations/staging-checkout/:id/refunds';
  router.get(refundsPath, operationsAuth, (req, res) => {
    const actor = (req as RequestAuthContext).auth;
    if (actor?.role !== 'admin') return void res.sendStatus(403);
    const record = read(req.params.id);
    if (!record) return void res.sendStatus(404);
    res.json({ success: true, refunds: record.refunds ?? [],
      canApprove: refundApprovers.has(actor.userId), actorId: actor.userId });
  });
  router.post(refundsPath, operationsAuth, async (req, res) => {
    const actor = (req as RequestAuthContext).auth;
    if (actor?.role !== 'admin') return void res.sendStatus(403);
    const { requestId, amountMinor, reason } = req.body ?? {};
    if (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{8,80}$/.test(requestId)
      || !Number.isSafeInteger(amountMinor) || amountMinor < 1
      || typeof reason !== 'string' || !reason.trim() || reason.length > 500) return void res.sendStatus(400);
    try {
      const refund = await serialized(req.params.id, async () => {
        const record = read(req.params.id);
        if (!record?.session) return;
        const refunds = record.refunds ?? [];
        const existing = refunds.find(item => item.id === requestId);
        if (existing) return existing.amountMinor === amountMinor && existing.reason === reason.trim()
          && existing.requestedBy === actor.userId ? existing : undefined;
        const { payment_intent: intent } = await session(record);
        if (intent?.status !== 'succeeded' || intent.amount_received !== record.amount) return;
        const reserved = refunds.filter(item => !['failed', 'canceled'].includes(item.provider?.status ?? ''))
          .reduce((sum, item) => sum + item.amountMinor, 0);
        if (amountMinor > intent.amount_received - reserved) return;
        const refund = { id: requestId, amountMinor, reason: reason.trim(),
          requestedBy: actor.userId, requestedAt: new Date().toISOString() };
        save({ ...record, refunds: [...refunds, refund] });
        return refund;
      });
      if (!refund) return void res.sendStatus(409);
      res.json({ success: true, refund });
    } catch { res.sendStatus(503); }
  });
  router.post(refundsPath + '/:refundId/approve', operationsAuth, async (req, res) => {
    const actor = (req as RequestAuthContext).auth;
    if (actor?.role !== 'admin' || !refundApprovers.has(actor.userId)) return void res.sendStatus(403);
    try {
      const refund = await serialized(req.params.id, async () => {
        let record = read(req.params.id);
        const requested = record?.refunds?.find(item => item.id === req.params.refundId);
        if (!record || !requested || requested.requestedBy === actor.userId) return;
        if (requested.approval) return reconcileRefund(record, requested);
        const { payment_intent: intent } = await session(record);
        if (intent?.status !== 'succeeded' || intent.amount_received !== record.amount) return;
        const approved = { ...requested, approval: { by: actor.userId, at: Date.now(), intent: intent.id } };
        record = replaceRefund(record, approved);
        return reconcileRefund(record, approved);
      });
      if (!refund) return void res.sendStatus(409);
      res.json({ success: true, refund });
    } catch { res.sendStatus(503); }
  });
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.post('/operations/staging-checkout/:id/confirm', createAuthenticationMiddleware(verify), async (req, res) => {
    const actor = (req as RequestAuthContext).auth;
    if (actor?.role !== 'admin') return void res.sendStatus(403);
    const ride = booking(req.params.id);
    if (!ride?.customerIdentityVerified) return void res.sendStatus(404);
    const amount = req.body?.amountMinor === undefined ? Math.round(ride.fareQuote.fareTotal * 100) : req.body.amountMinor;
    if (terminal.has(ride.status) || !Number.isSafeInteger(amount) || amount < 50 || amount > 99_999_999) return void res.sendStatus(409);
    try {
      const confirmed = await serialized(ride.id, async () => {
        if (terminal.has(booking(ride.id)?.status ?? 'failed')) return;
        const current = read(ride.id);
        if (current?.amount === amount) return current;
        if (current && !await closeForReplacement(current)) return;
        if (terminal.has(booking(ride.id)?.status ?? 'failed')) return;
        const replacement = current ? renewed(current, amount) : { id: ride.id, amount, startedAt: 0, revision: 1 };
        return save({ ...replacement, confirmedBy: actor.userId, confirmedAt: new Date().toISOString() });
      });
      if (!confirmed) return void res.sendStatus(409);
      res.json({ success: true, amountMinor: confirmed.amount, revision: revision(confirmed) });
    } catch { res.status(503).json({ message: 'Fare confirmation unavailable' }); }
  });
  const customer = createAuthenticationMiddleware(verifyCustomer);
  router.get('/customer/staging-checkout/:id', customer, async (req, res) => {
    const auth = (req as RequestAuthContext).auth;
    const ride = booking(req.params.id);
    if (auth?.role !== 'customer' || !ride?.customerIdentityVerified || ride.customerId !== auth.userId) return void res.sendStatus(404);
    try {
      const payment = await serialized(ride.id, async () => {
        const record = read(ride.id);
        return record ? view(record) : null;
      });
      res.json({ success: true, payment });
    } catch { res.status(503).json({ message: 'Checkout status unavailable' }); }
  });
  router.post('/customer/staging-checkout/:id', customer, async (req, res) => {
    const auth = (req as RequestAuthContext).auth;
    const ride = booking(req.params.id);
    if (auth?.role !== 'customer' || !ride?.customerIdentityVerified || ride.customerId !== auth.userId) return void res.sendStatus(404);
    try {
      const url = await serialized(ride.id, async () => {
        let record = read(ride.id);
        if (!record || terminal.has(booking(ride.id)?.status ?? 'failed')) return;
        if (req.body?.expectedAmountMinor !== record.amount || req.body?.expectedRevision !== revision(record)) return;
        if (record.session) {
          const previous = await session(record);
          if (expired(previous)) {
            record = save(renewed(record, record.amount));
          }
        }
        if (!record.session) {
          if (!record.startedAt) record = save({ ...record, startedAt: Date.now() });
          if (Date.now() - record.startedAt >= 23 * 60 * 60 * 1000) return;
          const checkout = await stripe<Session>('/checkout/sessions', identity(record), 'create', {
            mode: 'payment', success_url: origin + '/ride?checkout=' + encodeURIComponent(ride.id), cancel_url: origin + '/ride?checkout=' + encodeURIComponent(ride.id),
            'line_items[0][quantity]': '1', 'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][unit_amount]': String(record.amount),
            'line_items[0][price_data][product_data][name]': 'LVTransport staging · ' + ride.referenceCode,
            'payment_intent_data[capture_method]': 'manual',
          });
          if (!/^cs_test_[A-Za-z0-9_]+$/.test(checkout.id) || checkout.amount_total !== record.amount || checkout.currency !== 'eur') throw Error('Invalid Checkout session');
          record = save({ ...record, session: checkout.id });
        }
        const current = await session(record);
        if (current.status !== 'open' || !current.url) return;
        const link = new URL(current.url);
        if (link.origin !== 'https://checkout.stripe.com') throw Error('Unexpected Checkout host');
        return link.href;
      });
      if (!url) return void res.status(409).json({ message: 'Checkout is unavailable for this booking' });
      res.json({ success: true, url });
    } catch { res.status(503).json({ message: 'Checkout unavailable' }); }
  });
  let sweeping = false;
  const timer = setInterval(async () => {
    if (sweeping) return;
    sweeping = true;
    try {
      const records = readdirSync(directory).filter(name => /^[a-f0-9]{64}\.json$/.test(name))
        .map(file => JSON.parse(readFileSync(join(directory, file), 'utf8')) as CheckoutRecord);
      await webhooks?.reconcile(async sessionId => {
        const record = records.find(item => item.session === sessionId || item.previous?.some(previous => previous.session === sessionId));
        if (!record) return false;
        return serialized(record.id, async () => {
          const current = read(record.id);
          if (!current) return false;
          if (current.session === sessionId) await view(current);
          return true;
        });
      });
      for (const record of records) {
        if (record.session && terminal.has(booking(record.id)?.status ?? '')) {
          await serialized(record.id, async () => {
            const current = read(record.id);
            if (!current?.session) return;
            await view(current);
            let latest = current;
            for (const refund of current.refunds ?? []) {
              await reconcileRefund(latest, refund).catch(() => {});
              latest = read(record.id) ?? latest;
            }
          }).catch(() => {});
        }
      }
    } catch {
      // The next pass retries if the local checkout store is temporarily unavailable.
    } finally { sweeping = false; }
  }, 5000);
  timer.unref();
  return router;
}
