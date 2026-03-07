// TTL-based in-memory cache with stale-while-error fallback
const store = new Map()

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() < entry.expiresAt) return { data: entry.data, stale: false }
  // Expired but still available as stale fallback
  return { data: entry.data, stale: true }
}

export function cacheSet(key, data, ttlMs) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs, setAt: Date.now() })
}

// Main utility: returns fresh cache, or fetches, or returns stale cache on failure
export async function getOrFetch(key, fetchFn, ttlMs) {
  const cached = cacheGet(key)
  if (cached && !cached.stale) return cached.data

  try {
    const data = await fetchFn()
    cacheSet(key, data, ttlMs)
    return data
  } catch (err) {
    // Stale-while-error: return expired data rather than throwing
    if (cached) return cached.data
    throw err
  }
}

export function cacheClear(key) {
  if (key) store.delete(key)
  else store.clear()
}
