import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { cacheGet, cacheSet, getOrFetch, cacheClear } from './cache'

describe('cache', () => {
  beforeEach(() => {
    cacheClear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('cacheGet / cacheSet', () => {
    it('returns null for an unknown key', () => {
      expect(cacheGet('missing')).toBeNull()
    })

    it('returns fresh data within the TTL window', () => {
      cacheSet('k', { v: 1 }, 10_000)
      const result = cacheGet<{ v: number }>('k')
      expect(result).toEqual({ data: { v: 1 }, stale: false })
    })

    it('marks data stale once the TTL has elapsed but still returns it', () => {
      vi.useFakeTimers()
      vi.setSystemTime(0)
      cacheSet('k', 'value', 1_000)
      vi.setSystemTime(2_000)
      expect(cacheGet('k')).toEqual({ data: 'value', stale: true })
    })

    it('preserves the most recent value when a key is overwritten', () => {
      cacheSet('k', 'old', 10_000)
      cacheSet('k', 'new', 10_000)
      expect(cacheGet<string>('k')?.data).toBe('new')
    })
  })

  describe('eviction', () => {
    it('evicts the oldest entry once MAX_SIZE (100) is exceeded', () => {
      for (let i = 0; i < 100; i++) cacheSet(`k${i}`, i, 60_000)
      // Cache is full; inserting a new key must evict the oldest (k0).
      cacheSet('k100', 100, 60_000)
      expect(cacheGet('k0')).toBeNull()
      expect(cacheGet<number>('k100')?.data).toBe(100)
      expect(cacheGet<number>('k1')?.data).toBe(1)
    })

    it('does not evict when overwriting an existing key at capacity', () => {
      for (let i = 0; i < 100; i++) cacheSet(`k${i}`, i, 60_000)
      cacheSet('k0', 999, 60_000) // overwrite, not a new key
      expect(cacheGet<number>('k0')?.data).toBe(999)
      expect(cacheGet<number>('k50')?.data).toBe(50)
    })
  })

  describe('cacheClear', () => {
    it('clears a single key when given an argument', () => {
      cacheSet('a', 1, 10_000)
      cacheSet('b', 2, 10_000)
      cacheClear('a')
      expect(cacheGet('a')).toBeNull()
      expect(cacheGet<number>('b')?.data).toBe(2)
    })

    it('clears everything when called with no argument', () => {
      cacheSet('a', 1, 10_000)
      cacheSet('b', 2, 10_000)
      cacheClear()
      expect(cacheGet('a')).toBeNull()
      expect(cacheGet('b')).toBeNull()
    })
  })

  describe('getOrFetch', () => {
    it('returns cached data without calling the fetcher when fresh', async () => {
      cacheSet('k', 'cached', 10_000)
      const fetchFn = vi.fn().mockResolvedValue('fetched')
      const result = await getOrFetch('k', fetchFn, 10_000)
      expect(result).toBe('cached')
      expect(fetchFn).not.toHaveBeenCalled()
    })

    it('invokes the fetcher and caches the result on a miss', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fresh')
      const result = await getOrFetch('miss', fetchFn, 10_000)
      expect(result).toBe('fresh')
      expect(fetchFn).toHaveBeenCalledTimes(1)
      // Now cached and fresh, so a second call must not refetch.
      await getOrFetch('miss', fetchFn, 10_000)
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('refetches when the cached entry is stale', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(0)
      cacheSet('k', 'old', 1_000)
      vi.setSystemTime(5_000)
      const fetchFn = vi.fn().mockResolvedValue('new')
      const result = await getOrFetch('k', fetchFn, 1_000)
      expect(result).toBe('new')
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('falls back to stale cached data when the fetcher throws', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(0)
      cacheSet('k', 'stale-but-usable', 1_000)
      vi.setSystemTime(5_000)
      const fetchFn = vi.fn().mockRejectedValue(new Error('network down'))
      const result = await getOrFetch('k', fetchFn, 1_000)
      expect(result).toBe('stale-but-usable')
    })

    it('rethrows when the fetcher fails and there is no cached fallback', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('boom'))
      await expect(getOrFetch('cold', fetchFn, 1_000)).rejects.toThrow('boom')
    })
  })
})
