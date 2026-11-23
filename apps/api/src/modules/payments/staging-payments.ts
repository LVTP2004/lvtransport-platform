import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { VerifiedIdentity } from '../../auth/middleware/authenticate.js';
import type { BookingRecord } from '../bookings/dto.js';

type PaymentBooking = Pick<BookingRecord, 'id' | 'status' | 'customerId' | 'customerIdentityVerified'>;
type ConfirmedFare = { amountMinor: number; currency: 'EUR' };
type Receipt = { id: string; capturedAt: string };
export type StagingPayment = ConfirmedFare & ({ status: 'authorized' | 'released' } | { status: 'captured'; receipt: Receipt });

export interface StagingPaymentRepository {
  get(bookingId: string): StagingPayment | undefined;
  update(bookingId: string, change: (current: StagingPayment | undefined) => StagingPayment | undefined): StagingPayment | undefined;
}

export class FileStagingPaymentRepository implements StagingPaymentRepository {
  constructor(private readonly file: string) {}

  private read(): Array<{ bookingId: string; payment: StagingPayment }> {
    if (!existsSync(this.file)) return [];
    const records: unknown = JSON.parse(readFileSync(this.file, 'utf-8'));
    if (!Array.isArray(records)) throw new Error('Invalid staging payment store');
    return records;
  }

  authorizedBookingIds(): string[] {
    return this.read().filter(({ payment }) => payment.status === 'authorized').map(({ bookingId }) => bookingId);
  }

  get(bookingId: string) {
    return this.read().find(record => record.bookingId === bookingId)?.payment;
  }

  // One staging process owns this file. The read, comparison and replacement run synchronously.
  update(bookingId: string, change: (current: StagingPayment | undefined) => StagingPayment | undefined) {
    const records = this.read();
    const current = records.find(record => record.bookingId === bookingId)?.payment;
    const payment = change(current);
    if (!payment || payment === current) return payment;

    const folder = dirname(this.file);
    mkdirSync(folder, { recursive: true, mode: 0o700 });
    const temp = `${this.file}.${randomUUID()}.tmp`;
    try {
      const fd = openSync(temp, 'wx', 0o600);
      try {
        const next = records.filter(record => record.bookingId !== bookingId);
        next.push({ bookingId, payment });
        writeFileSync(fd, JSON.stringify(next), 'utf-8');
        fsyncSync(fd);
      } finally { closeSync(fd); }
      renameSync(temp, this.file);
      const directory = openSync(folder, 'r');
      try { fsyncSync(directory); } finally { closeSync(directory); }
    } finally {
      if (existsSync(temp)) unlinkSync(temp);
    }
    return payment;
  }
}

export interface StagingPaymentProvider {
  authorize(bookingId: string, fare: ConfirmedFare): void;
  capture(bookingId: string, fare: ConfirmedFare): string;
  release(bookingId: string, fare: ConfirmedFare): void;
}

// This simulator performs no external I/O. Capture identity is deterministic for retries.
export const simulatedPaymentProvider: StagingPaymentProvider = {
  authorize() {},
  capture(bookingId, fare) {
    const digest = createHash('sha256').update(JSON.stringify([bookingId, fare.amountMinor, fare.currency])).digest('hex');
    return `STAGING-${digest.slice(0, 24)}`;
  },
  release() {},
};

export class StagingPaymentService {
  constructor(
    private readonly lookupBooking: (bookingId: string) => Promise<PaymentBooking | null>,
    private readonly lookupConfirmedFare: (bookingId: string) => Promise<ConfirmedFare | null>,
    private readonly repository: StagingPaymentRepository,
    private readonly provider: StagingPaymentProvider = simulatedPaymentProvider,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async readOwn(actor: VerifiedIdentity, bookingId: string): Promise<StagingPayment | null | undefined> {
    if (actor.role !== 'customer' || actor.status !== 'active') return undefined;
    const booking = await this.lookupBooking(bookingId);
    if (!booking || booking.customerIdentityVerified !== true || booking.customerId !== actor.userId) return undefined;
    const payment = this.repository.get(booking.id);
    if (!payment) return null;
    const { amountMinor, currency } = payment;
    return payment.status === 'captured'
      ? { amountMinor, currency, status: payment.status, receipt: payment.receipt }
      : { amountMinor, currency, status: payment.status };
  }

  async reconcile(bookingId: string): Promise<StagingPayment | undefined> {
    const fare = await this.lookupConfirmedFare(bookingId);
    const booking = await this.lookupBooking(bookingId);
    if (!booking || booking.customerIdentityVerified !== true || !booking.customerId) return undefined;
    return this.repository.update(booking.id, current => {
      if (current?.status === 'authorized' && booking.status === 'completed') {
        const capturedAt = this.now();
        const id = this.provider.capture(booking.id, current);
        return { ...current, status: 'captured', receipt: { id, capturedAt } };
      }
      if (current?.status === 'authorized' && (booking.status === 'cancelled' || booking.status === 'failed')) {
        this.provider.release(booking.id, current);
        return { ...current, status: 'released' };
      }
      if (current || booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'failed') return current;
      if (!fare || fare.currency !== 'EUR' || !Number.isSafeInteger(fare.amountMinor) || fare.amountMinor <= 0) return undefined;

      const confirmedFare = { amountMinor: fare.amountMinor, currency: fare.currency };
      this.provider.authorize(booking.id, confirmedFare);
      return { ...confirmedFare, status: 'authorized' };
    });
  }
}
