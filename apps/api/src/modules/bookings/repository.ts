import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createReferenceCode } from './reference-code.js';
import { dirname, resolve } from 'node:path';
import type { BookingRecord } from './dto.js';
import { createBookingDuplicateFingerprint } from './fingerprint.js';

export interface BookingRepository {
  create(record: BookingRecord): Promise<BookingRecord>;
  update(record: BookingRecord): Promise<BookingRecord>;
  findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null>;
  findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null>;
  list(): Promise<BookingRecord[]>;
}

export type OperationalVehicle = {
  id: string; registration: string; name: string; fleetType: 'own' | 'external'; enabled: boolean;
};
export type OperationalDriver = {
  id: string; name: string; vehicleId: string; availability: 'available' | 'unavailable';
  lastSeenAt: string; lastChangeAt: string;
};
export type OperationReceipt = {
  id: string; bookingId: string; version: number; state: string; appliedAt: string;
};
export type BookingStore = {
  bookings: BookingRecord[];
  idempotencyIndex: Record<string, string>;
  fingerprintIndex?: Record<string, { bookingId: string; createdAt: string }>;
  vehicles?: Record<string, OperationalVehicle>;
  drivers?: Record<string, OperationalDriver>;
  operations?: Record<string, { digest: string; receipt: OperationReceipt }>;
};

export class FileBookingRepository implements BookingRepository {
  constructor(private readonly storageFile = resolve(process.cwd(), '.data', 'bookings.json')) {}

  private ensureFile(): void {
    const folder = dirname(this.storageFile);
    if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
    if (!existsSync(this.storageFile)) {
      this.writeStore({ bookings: [], idempotencyIndex: {} });
    }
  }

  private readStore(): BookingStore {
    this.ensureFile();
    const raw = readFileSync(this.storageFile, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<BookingStore>;
    if (!parsed || !Array.isArray(parsed.bookings)) throw new Error('Invalid booking storage');
    return {
      ...parsed,
      bookings: parsed.bookings,
      idempotencyIndex: parsed.idempotencyIndex ?? {},
      fingerprintIndex: parsed.fingerprintIndex ?? {},
    };
  }

  private writeStore(store: BookingStore): void {
    const temp = `${this.storageFile}.${randomUUID()}.tmp`;
    const encoded = JSON.stringify(store, null, 2);
    try {
      const fd = openSync(temp, 'wx', 0o600);
      try {
        writeFileSync(fd, encoded, 'utf-8');
        fsyncSync(fd);
      } finally { closeSync(fd); }
      renameSync(temp, this.storageFile);
      const directory = openSync(dirname(this.storageFile), 'r');
      try { fsyncSync(directory); } finally { closeSync(directory); }
      if (readFileSync(this.storageFile, 'utf-8') !== encoded) throw new Error('Booking persistence verification failed');
    } finally {
      if (existsSync(temp)) unlinkSync(temp);
    }
  }

  /** Synchronous read/validate/write: atomic between requests in this API process.
   * The file repository requires one writer process, as before; not a distributed transaction.
   */
  transact<T>(change: (store: BookingStore) => T): T {
    const store = this.readStore();
    const result = change(store);
    this.writeStore(store);
    return result;
  }

  snapshot(): BookingStore { return this.readStore(); }

  async create(record: BookingRecord): Promise<BookingRecord> {
    const store = this.readStore();
    const idempotencyKey = record.lifecycle.initIdempotencyKey;
    if (store.idempotencyIndex[idempotencyKey]) {
      const existing = store.bookings.find((b) => b.id === store.idempotencyIndex[idempotencyKey]);
      if (existing) {
        if ((existing.customerIdentityVerified === true) !== (record.customerIdentityVerified === true)
            || (record.customerIdentityVerified === true && existing.customerId !== record.customerId)) {
          throw new Error('Booking identity scope conflict');
        }
        return existing;
      }
    }

    const used = new Set(store.bookings.map(booking => booking.referenceCode));
    const referenceCode = used.has(record.referenceCode) ? createReferenceCode(used) : record.referenceCode;
    const saved = referenceCode === record.referenceCode ? record : { ...record, referenceCode };
    store.bookings.unshift(saved);
    store.idempotencyIndex[idempotencyKey] = record.id;
    const fingerprint = createBookingDuplicateFingerprint(record);
    if (fingerprint) {
      store.fingerprintIndex ??= {};
      store.fingerprintIndex[fingerprint] = { bookingId: record.id, createdAt: record.createdAt };
    }
    this.writeStore(store);
    return saved;
  }

  async update(record: BookingRecord): Promise<BookingRecord> {
    const store = this.readStore();
    const index = store.bookings.findIndex((booking) => booking.id === record.id);
    if (index === -1) throw new Error('Booking not found');
    store.bookings[index] = record;
    this.writeStore(store);
    return record;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null> {
    const store = this.readStore();
    const id = store.idempotencyIndex[idempotencyKey];
    if (!id) return null;
    return store.bookings.find((b) => b.id === id) ?? null;
  }

  async list(): Promise<BookingRecord[]> {
    const store = this.readStore();
    return [...store.bookings];
  }

  async findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null> {
    const store = this.readStore();
    const entry = store.fingerprintIndex?.[fingerprint];
    if (!entry) return null;
    const age = Date.now() - new Date(entry.createdAt).getTime();
    if (age > maxAgeMs) return null;
    return store.bookings.find((booking) => booking.id === entry.bookingId) ?? null;
  }
}

export const fileBookingRepository = new FileBookingRepository();
export const bookingRepository: BookingRepository = fileBookingRepository;
