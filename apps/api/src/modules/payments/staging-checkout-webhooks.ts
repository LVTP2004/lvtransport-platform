import { createHmac, timingSafeEqual } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { raw, Router } from 'express';

const checkoutEvents = new Set([
  'checkout.session.completed', 'checkout.session.expired',
  'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
]);
type Delivery = { id: string; type: string; sessionId: string; receivedAt: string; processedAt?: string };

function verifySignature(secret: string, body: Buffer, signature: string) {
  const parts = signature.split(',').map(part => part.trim().split('='));
  const timestamps = parts.filter(([key]) => key === 't');
  const timestamp = timestamps[0]?.[1] ?? '';
  if (timestamps.length !== 1 || !/^\d{1,12}$/.test(timestamp)
    || Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(timestamp + '.').update(body).digest();
  return parts.some(([key, value]) => key === 'v1' && /^[a-f0-9]{64}$/i.test(value)
    && timingSafeEqual(expected, Buffer.from(value, 'hex')));
}

export function createStagingCheckoutWebhooks(directory: string, secret: string) {
  if (!/^whsec_[A-Za-z0-9]+$/.test(secret)) throw Error('Invalid Stripe signing secret');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const router = Router();

  function save(file: string, delivery: Delivery) {
    const temporary = file + '.tmp';
    const fd = openSync(temporary, 'w', 0o600);
    try { writeFileSync(fd, JSON.stringify(delivery)); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temporary, file);
    const parent = openSync(directory, 'r');
    try { fsyncSync(parent); } finally { closeSync(parent); }
  }

  router.post('/staging-checkout/webhook', raw({ type: 'application/json', limit: '256kb', inflate: false }), (req, res) => {
    const body: unknown = req.body;
    if (!Buffer.isBuffer(body) || !verifySignature(secret, body, req.get('Stripe-Signature') ?? '')) {
      return void res.sendStatus(400);
    }
    let event;
    try { event = JSON.parse(body.toString('utf8')); } catch { return void res.sendStatus(400); }
    if (event?.livemode !== false || event.object !== 'event' || typeof event.id !== 'string'
      || !/^evt_[A-Za-z0-9_]{1,120}$/.test(event.id) || typeof event.type !== 'string') return void res.sendStatus(400);
    if (!checkoutEvents.has(event.type)) return void res.sendStatus(204);
    const object = event.data?.object;
    if (object?.object !== 'checkout.session' || typeof object.id !== 'string'
      || !/^cs_test_[A-Za-z0-9_]+$/.test(object.id)) return void res.sendStatus(400);

    try {
      const file = join(directory, event.id + '.json');
      if (!existsSync(file)) save(file, {
        id: event.id, type: event.type, sessionId: object.id, receivedAt: new Date().toISOString(),
      });
      res.sendStatus(204);
    } catch { res.sendStatus(503); }
  });

  async function reconcile(processSession: (sessionId: string) => Promise<boolean>) {
    for (const name of readdirSync(directory).filter(name => /^evt_[A-Za-z0-9_]+\.json$/.test(name))) {
      const file = join(directory, name);
      try {
        const delivery = JSON.parse(readFileSync(file, 'utf8')) as Delivery;
        if (!delivery.processedAt && await processSession(delivery.sessionId)) {
          save(file, { ...delivery, processedAt: new Date().toISOString() });
        }
      } catch {
        // Leave this delivery pending for the next pass.
      }
    }
  }

  return { router, reconcile };
}
