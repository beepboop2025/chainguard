import type { FeedName, FeedStatusValue, FeedStatusMap, OverallStatus } from '../types'

type FeedStatusCallback = (status: FeedStatusMap) => void

const feedStatus: FeedStatusMap = {
  prices_ws: 'disconnected',
  prices_rest: 'unknown',
  gas: 'unknown',
  whales: 'unknown',
  threats: 'unknown',
  defi: 'unknown',
}

const listeners = new Set<FeedStatusCallback>()

export function updateFeedStatus(feed: FeedName, status: FeedStatusValue): void {
  if (feedStatus[feed] === status) return
  feedStatus[feed] = status
  listeners.forEach(fn => fn({ ...feedStatus }))
}

export function getFeedStatus(): FeedStatusMap {
  return { ...feedStatus }
}

export function getOverallStatus(): OverallStatus {
  const values = Object.values(feedStatus)
  const liveCount = values.filter(v => v === 'connected' || v === 'live').length
  if (liveCount >= 3) return 'live'
  if (liveCount >= 1) return 'partial'
  const cachedCount = values.filter(v => v === 'cached').length
  if (cachedCount > 0) return 'partial'
  return 'offline'
}

export function subscribe(callback: FeedStatusCallback): () => void {
  listeners.add(callback)
  callback({ ...feedStatus })
  return () => { listeners.delete(callback) }
}
