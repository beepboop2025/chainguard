import { API_URLS, COINGECKO_IDS, COINCAP_TO_SYMBOL, COINCAP_ASSETS, CACHE_TTL } from './apiConfig'
import { getOrFetch, cacheSet, cacheGet } from './cache'
import { updateFeedStatus } from './connectionManager'

let ws = null
let reconnectTimer = null
let reconnectDelay = 1000

// --- CoinCap WebSocket for real-time price streaming ---

export function connectPriceWebSocket(onPriceUpdate) {
  if (ws && ws.readyState === WebSocket.OPEN) return () => disconnectWebSocket()

  const connect = () => {
    try {
      ws = new WebSocket(`${API_URLS.COINCAP_WS}?assets=${COINCAP_ASSETS}`)

      ws.onopen = () => {
        reconnectDelay = 1000
        updateFeedStatus('prices_ws', 'connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // CoinCap sends: { bitcoin: "98452.12", ethereum: "3845.23", ... }
          for (const [assetId, priceStr] of Object.entries(data)) {
            const symbol = COINCAP_TO_SYMBOL[assetId]
            if (symbol) {
              const price = parseFloat(priceStr)
              if (!isNaN(price)) onPriceUpdate({ symbol, price })
            }
          }
        } catch { /* ignore malformed messages */ }
      }

      ws.onclose = () => {
        updateFeedStatus('prices_ws', 'reconnecting')
        scheduleReconnect(connect)
      }

      ws.onerror = () => {
        updateFeedStatus('prices_ws', 'reconnecting')
        ws?.close()
      }
    } catch {
      updateFeedStatus('prices_ws', 'disconnected')
      scheduleReconnect(connect)
    }
  }

  connect()
  return () => disconnectWebSocket()
}

function scheduleReconnect(connectFn) {
  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    reconnectDelay = Math.min(reconnectDelay * 2, 30000)
    connectFn()
  }, reconnectDelay)
}

function disconnectWebSocket() {
  clearTimeout(reconnectTimer)
  if (ws) {
    ws.onclose = null // prevent reconnect on intentional close
    ws.close()
    ws = null
  }
  updateFeedStatus('prices_ws', 'disconnected')
}

// --- CoinGecko REST for 24h change + market data ---

export async function fetchTokenDetails() {
  const ids = Object.values(COINGECKO_IDS).join(',')
  return getOrFetch('token_details', async () => {
    const res = await fetch(
      `${API_URLS.COINGECKO}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
    const data = await res.json()

    // Transform: { bitcoin: { usd: 98420, usd_24h_change: 1.12 } } → { BTC: { price, change24h } }
    const result = {}
    for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
      const coin = data[geckoId]
      if (coin) {
        result[symbol] = {
          price: coin.usd,
          change24h: coin.usd_24h_change ?? 0,
          marketCap: coin.usd_market_cap ?? 0,
        }
      }
    }
    updateFeedStatus('prices_rest', 'live')
    return result
  }, CACHE_TTL.PRICES_REST)
}

// --- CoinGecko REST for historical price chart ---

export async function fetchPriceHistory(days = 90) {
  return getOrFetch(`price_history_${days}`, async () => {
    // Fetch ETH + BTC to approximate total portfolio trend
    const res = await fetch(
      `${API_URLS.COINGECKO}/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`CoinGecko history ${res.status}`)
    const data = await res.json()

    // Transform: { prices: [[timestamp, price], ...] } → [{ date: 'Mar 15', value: 3842 }]
    return data.prices.map(([ts, price]) => {
      const d = new Date(ts)
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(price),
      }
    })
  }, CACHE_TTL.PRICE_HISTORY)
}
