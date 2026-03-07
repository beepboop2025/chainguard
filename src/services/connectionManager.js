// Centralized connection state for all data feeds
const feedStatus = {
  prices_ws: 'disconnected',  // 'connected' | 'reconnecting' | 'disconnected'
  prices_rest: 'unknown',     // 'live' | 'cached' | 'error'
  gas: 'unknown',
  whales: 'unknown',
  threats: 'unknown',
  defi: 'unknown',
}

const listeners = new Set()

export function updateFeedStatus(feed, status) {
  if (feedStatus[feed] === status) return
  feedStatus[feed] = status
  listeners.forEach(fn => fn({ ...feedStatus }))
}

export function getFeedStatus() {
  return { ...feedStatus }
}

export function getOverallStatus() {
  const values = Object.values(feedStatus)
  const liveCount = values.filter(v => v === 'connected' || v === 'live').length
  if (liveCount >= 3) return 'live'
  if (liveCount >= 1) return 'partial'
  const cachedCount = values.filter(v => v === 'cached').length
  if (cachedCount > 0) return 'partial'
  return 'offline'
}

export function subscribe(callback) {
  listeners.add(callback)
  // Immediately emit current state
  callback({ ...feedStatus })
  return () => listeners.delete(callback)
}
