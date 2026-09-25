type CacheEntry<Value> = {
  promise: Promise<Value>
  storedAt: number
}

export function createTimedPromiseCache<Value>(ttlMs: number, now: () => number = Date.now) {
  const entries = new Map<string, CacheEntry<Value>>()

  return {
    load(key: string, loader: () => Promise<Value>, { forceRefresh = false } = {}) {
      const cachedEntry = entries.get(key)
      if (!forceRefresh && cachedEntry && now() - cachedEntry.storedAt < ttlMs) return cachedEntry.promise

      const promise = loader()
      entries.set(key, { promise, storedAt: now() })
      promise.catch(() => {
        if (entries.get(key)?.promise === promise) entries.delete(key)
      })
      return promise
    },
  }
}
