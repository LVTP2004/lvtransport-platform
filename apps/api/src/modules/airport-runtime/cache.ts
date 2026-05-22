type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class AirportRuntimeCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, value: T, ttlMs = 180_000) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  stats() {
    return {
      keys: this.cache.size,
      synchronizedAt: new Date().toISOString(),
    };
  }
}

export const airportRuntimeCache = new AirportRuntimeCache();
