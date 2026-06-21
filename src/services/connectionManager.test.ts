import { describe, it, expect, vi } from 'vitest'
import {
  updateFeedStatus,
  getFeedStatus,
  getOverallStatus,
  subscribe,
} from './connectionManager'
import type { FeedName, FeedStatusValue } from '../types'

const ALL_FEEDS: FeedName[] = ['prices_ws', 'prices_rest', 'gas', 'whales', 'threats', 'defi']

function resetAll(value: FeedStatusValue = 'disconnected') {
  ALL_FEEDS.forEach(f => updateFeedStatus(f, value))
}

describe('connectionManager', () => {
  it('getFeedStatus returns a snapshot copy, not the live internal object', () => {
    const a = getFeedStatus()
    const b = getFeedStatus()
    expect(a).not.toBe(b)
    // Mutating the returned copy must not affect subsequent reads.
    a.gas = 'live'
    expect(getFeedStatus().gas).not.toBe('live')
  })

  it('updateFeedStatus changes the stored status for a feed', () => {
    updateFeedStatus('gas', 'live')
    expect(getFeedStatus().gas).toBe('live')
    updateFeedStatus('gas', 'error')
    expect(getFeedStatus().gas).toBe('error')
  })

  it('does not notify listeners when the status is unchanged', () => {
    updateFeedStatus('defi', 'cached')
    const listener = vi.fn()
    const unsub = subscribe(listener)
    listener.mockClear() // ignore the initial immediate emit
    updateFeedStatus('defi', 'cached') // same value => no-op
    expect(listener).not.toHaveBeenCalled()
    updateFeedStatus('defi', 'live') // changed => notify
    expect(listener).toHaveBeenCalledTimes(1)
    unsub()
  })

  describe('getOverallStatus', () => {
    it('reports offline when no feed is live, connected, or cached', () => {
      resetAll('disconnected')
      expect(getOverallStatus()).toBe('offline')
    })

    it('reports partial with a single live feed', () => {
      resetAll('disconnected')
      updateFeedStatus('gas', 'live')
      expect(getOverallStatus()).toBe('partial')
    })

    it('reports partial when only cached feeds exist', () => {
      resetAll('disconnected')
      updateFeedStatus('defi', 'cached')
      updateFeedStatus('gas', 'cached')
      expect(getOverallStatus()).toBe('partial')
    })

    it('reports live once three or more feeds are connected or live', () => {
      resetAll('disconnected')
      updateFeedStatus('prices_ws', 'connected')
      updateFeedStatus('gas', 'live')
      updateFeedStatus('whales', 'connected')
      expect(getOverallStatus()).toBe('live')
    })

    it('treats connected and live equivalently toward the live threshold', () => {
      resetAll('disconnected')
      updateFeedStatus('prices_ws', 'live')
      updateFeedStatus('prices_rest', 'live')
      expect(getOverallStatus()).toBe('partial') // only 2 live
      updateFeedStatus('gas', 'connected')
      expect(getOverallStatus()).toBe('live') // now 3
    })
  })

  describe('subscribe', () => {
    it('emits the current status immediately on subscription', () => {
      resetAll('disconnected')
      const listener = vi.fn()
      const unsub = subscribe(listener)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.calls[0][0].gas).toBe('disconnected')
      unsub()
    })

    it('stops receiving updates after unsubscribing', () => {
      const listener = vi.fn()
      const unsub = subscribe(listener)
      listener.mockClear()
      unsub()
      updateFeedStatus('whales', 'live')
      expect(listener).not.toHaveBeenCalled()
    })

    it('delivers an independent snapshot to each notification', () => {
      const snapshots: unknown[] = []
      const unsub = subscribe(s => snapshots.push(s))
      updateFeedStatus('threats', 'live')
      expect(snapshots[snapshots.length - 1]).not.toBe(snapshots[0])
      unsub()
    })
  })
})
