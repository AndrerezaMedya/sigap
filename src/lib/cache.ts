type CacheItem<T> = {
  value: T;
  expiry: number;
};

class LRUCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private maxKeys: number;
  private defaultTtlMs: number;

  constructor(maxKeys = 100, defaultTtlMs = 1000 * 60 * 60) {
    this.maxKeys = maxKeys;
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU state by deleting and re-setting
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.cache.size >= this.maxKeys) {
      // delete oldest (first key in map iteration)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    const expiry = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance for generic API responses
export const globalCache = new LRUCache<unknown>(100, 1000 * 60 * 5); // 5 min default TTL (demo)
