import type { CacheEntry, CacheResult } from '../types'

const MAX_SIZE = 100
const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): CacheResult<T> | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() < entry.expiresAt) return { data: entry.data, stale: false }
  return { data: entry.data, stale: true }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  if (store.size >= MAX_SIZE && !store.has(key)) {
    // Delete the oldest entry (first key in insertion order)
    const oldestKey = store.keys().next().value
    if (oldestKey !== undefined) store.delete(oldestKey)
  }
  store.set(key, { data, expiresAt: Date.now() + ttlMs, setAt: Date.now() })
}

export async function getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number): Promise<T> {
  const cached = cacheGet<T>(key)
  if (cached && !cached.stale) return cached.data

  try {
    const data = await fetchFn()
    cacheSet(key, data, ttlMs)
    return data
  } catch (err) {
    if (cached) return cached.data
    throw err
  }
}

export function cacheClear(key?: string): void {
  if (key) store.delete(key)
  else store.clear()
}
