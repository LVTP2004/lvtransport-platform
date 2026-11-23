import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, type TestContext } from 'node:test';
import type { VerifiedIdentity } from '../../auth/middleware/authenticate.js';
import type { CanonicalBookingLifecycleStatus } from '../../types/lifecycle.js';
import { FileStagingPaymentRepository, simulatedPaymentProvider, StagingPaymentService } from './staging-payments.js';

const customer: VerifiedIdentity = { role: 'customer', status: 'active', userId: 'customer-1' };

function fixture(t: TestContext) {
  const folder = mkdtempSync(join(tmpdir(), 'lvtp-stage-payment-'));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const file = join(folder, 'payments.json');
  const booking = {
    id: 'booking-1',
    status: 'pending' as CanonicalBookingLifecycleStatus,
    customerId: customer.userId,
    customerIdentityVerified: true,
    fareQuote: { fareTotal: 123 },
  };
  const fixture = {
    booking,
    fare: null as { amountMinor: number; currency: 'EUR' } | null,
    providerCalls: [] as string[],
  };
  const repository = () => new FileStagingPaymentRepository(file);
  const service = () => new StagingPaymentService(
    async id => id === booking.id ? booking : null,
    async id => id === booking.id ? fixture.fare : null,
    repository(),
    {
      authorize() { fixture.providerCalls.push('authorize'); },
      capture(id, fare) {
        fixture.providerCalls.push('capture');
        return simulatedPaymentProvider.capture(id, fare);
      },
      release() { fixture.providerCalls.push('release'); },
    },
    () => '2026-11-20T09:00:00.000Z',
  );
  return { ...fixture, repository, confirmedFare: (amountMinor: number) => { fixture.fare = { amountMinor, currency: 'EUR' }; }, service };
}

test('authorizes an explicit EUR fare and captures once after completion, with a persisted receipt', async t => {
  const { booking, confirmedFare, repository, service, providerCalls } = fixture(t);
  const payment = service();
  assert.equal(await payment.reconcile(booking.id), undefined);
  assert.equal(await payment.readOwn(customer, booking.id), null);
  assert.deepEqual(providerCalls, []);
  confirmedFare(4200);
  const authorized = { amountMinor: 4200, currency: 'EUR', status: 'authorized' };
  assert.deepEqual(await Promise.all([payment.reconcile(booking.id), payment.reconcile(booking.id)]), [authorized, authorized]);
  booking.status = 'in_progress';
  assert.deepEqual(await payment.reconcile(booking.id), authorized);
  confirmedFare(9900);
  booking.status = 'completed';
  assert.deepEqual(repository().authorizedBookingIds(), [booking.id]);
  const captured = await service().reconcile(booking.id);
  assert.ok(captured?.status === 'captured');
  assert.equal(captured.amountMinor, 4200);
  assert.match(captured.receipt.id, /^STAGING-/);
  assert.equal(captured.receipt.capturedAt, '2026-11-20T09:00:00.000Z');
  const restarted = service();
  assert.deepEqual(await restarted.reconcile(booking.id), captured);
  assert.deepEqual(await restarted.readOwn(customer, booking.id), captured);
  assert.deepEqual(repository().authorizedBookingIds(), []);
  assert.deepEqual(providerCalls, ['authorize', 'capture']);
});

test('cancellation releases once, issues no receipt, and access applies only to the verified owner', async t => {
  const { booking, confirmedFare, repository, service, providerCalls } = fixture(t);
  const payment = service();
  confirmedFare(4200);
  assert.equal((await payment.reconcile(booking.id))?.status, 'authorized');
  booking.status = 'cancelled';
  assert.deepEqual(repository().authorizedBookingIds(), [booking.id]);
  const released = { amountMinor: 4200, currency: 'EUR', status: 'released' };
  assert.deepEqual(await payment.reconcile(booking.id), released);
  assert.deepEqual(await service().reconcile(booking.id), released);
  assert.deepEqual(await payment.readOwn(customer, booking.id), released);
  assert.equal(await payment.readOwn({ ...customer, role: 'driver' }, booking.id), undefined);
  assert.equal(await payment.readOwn({ ...customer, userId: 'customer-2' }, booking.id), undefined);
  assert.equal(await payment.readOwn(customer, 'missing'), undefined);
  booking.customerIdentityVerified = false;
  assert.equal(await payment.readOwn(customer, booking.id), undefined);
  assert.deepEqual(repository().authorizedBookingIds(), []);
  assert.deepEqual(providerCalls, ['authorize', 'release']);
});

test('rejects invalid fares and never retrospectively authorizes a terminal ride', async t => {
  const { booking, confirmedFare, service, providerCalls } = fixture(t);
  const payment = service();
  for (const amount of [0, -1, 3.14, Number.MAX_SAFE_INTEGER + 1]) {
    confirmedFare(amount);
    assert.equal(await payment.reconcile(booking.id), undefined);
  }
  confirmedFare(4200);
  booking.status = 'completed';
  assert.equal(await payment.reconcile(booking.id), undefined);
  booking.status = 'cancelled';
  assert.equal(await payment.reconcile(booking.id), undefined);
  assert.deepEqual(providerCalls, []);
});
