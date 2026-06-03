import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { BookingRecord } from './dto.js';

export interface BookingRepository {
  getById(id: string): Promise<BookingRecord | null>;
  create(record: BookingRecord): Promise<BookingRecord>;
  update(record: BookingRecord): Promise<BookingRecord>;
  findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null>;
  findRecentDuplicateFingerprint(fingerprint: string, maxAgeMs: number): Promise<BookingRecord | null>;
  list(): Promise<BookingRecord[]>;
}

type BookingStore = {
  bookings: BookingRecord[];
  idempotencyIndex: Record<string, string>;
  fingerprintIndex?: Record<string, { bookingId: string; createdAt: string }>;
};

class FileBookingRepository implements BookingRepository {
  private readonly storageFile = resolve(process.cwd(), '.data', 'bookings.json');

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
    return {
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      idempotencyIndex: parsed.idempotencyIndex ?? {},
      fingerprintIndex: parsed.fingerprintIndex ?? {},
    };
  }

  private writeStore(store: BookingStore): void {
    const temp = `${this.storageFile}.tmp`;
    writeFileSync(temp, JSON.stringify(store, null, 2), 'utf-8');
    renameSync(temp, this.storageFile);
  }

  async getById(id: string): Promise<BookingRecord | null> {
    const store = this.readStore();
    return store.bookings.find((booking) => booking.id === id) ?? null;
  }

  async create(record: BookingRecord): Promise<BookingRecord> {
    const store = this.readStore();
    const idempotencyKey = record.lifecycle.initIdempotencyKey;
    if (store.idempotencyIndex[idempotencyKey]) {
      const existing = store.bookings.find((b) => b.id === store.idempotencyIndex[idempotencyKey]);
      if (existing) return existing;
    }

    store.bookings.unshift(record);
    store.idempotencyIndex[idempotencyKey] = record.id;
    const fingerprint = `${record.pickup.trim().toLowerCase()}|${record.destination.trim().toLowerCase()}|${record.scheduleAt}|${record.serviceType}`;
    store.fingerprintIndex ??= {};
    store.fingerprintIndex[fingerprint] = { bookingId: record.id, createdAt: record.createdAt };
    this.writeStore(store);
    return record;
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

export const bookingRepository: BookingRepository = new FileBookingRepository();
