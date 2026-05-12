import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { BookingRecord } from './dto.js';

export interface BookingRepository {
  create(record: BookingRecord): Promise<BookingRecord>;
  findByIdempotencyKey(idempotencyKey: string): Promise<BookingRecord | null>;
  list(): Promise<BookingRecord[]>;
}

type BookingStore = {
  bookings: BookingRecord[];
  idempotencyIndex: Record<string, string>;
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
    };
  }

  private writeStore(store: BookingStore): void {
    const temp = `${this.storageFile}.tmp`;
    writeFileSync(temp, JSON.stringify(store, null, 2), 'utf-8');
    renameSync(temp, this.storageFile);
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
}

export const bookingRepository: BookingRepository = new FileBookingRepository();
