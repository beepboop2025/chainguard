import { API_URLS, COINGECKO_IDS, COINCAP_TO_SYMBOL, COINCAP_ASSETS, CACHE_TTL } from './apiConfig'
import { getOrFetch } from './cache'
import { updateFeedStatus } from './connectionManager'
import type { PriceUpdate, TokenDetail, PortfolioHistoryEntry } from '../types'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelay = 1000

export function connectPriceWebSocket(onPriceUpdate: (update: PriceUpdate) => void): () => void {
  if (ws && ws.readyState === WebSocket.OPEN) return () => disconnectWebSocket()

  reconnectDelay = 1000

  const connect = (): void => {
    try {
      ws = new WebSocket(`${API_URLS.COINCAP_WS}?assets=${COINCAP_ASSETS}`)

      ws.onopen = (): void => {
        reconnectDelay = 1000
        updateFeedStatus('prices_ws', 'connected')
      }

      ws.onmessage = (event: MessageEvent): void => {
        try {
          const data = JSON.parse(event.data as string) as Record<string, string>
          for (const [assetId, priceStr] of Object.entries(data)) {
            const symbol = COINCAP_TO_SYMBOL[assetId]
            if (symbol) {
              const price = parseFloat(priceStr)
              if (!isNaN(price)) onPriceUpdate({ symbol, price })
            }
          }
        } catch { /* ignore malformed messages */ }
      }

      ws.onclose = (): void => {
        updateFeedStatus('prices_ws', 'reconnecting')
        scheduleReconnect(connect)
      }

      ws.onerror = (): void => {
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

function scheduleReconnect(connectFn: () => void): void {
  if (reconnectTimer !== null) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    reconnectDelay = Math.min(reconnectDelay * 2, 30000)
    connectFn()
  }, reconnectDelay)
}

function disconnectWebSocket(): void {
  if (reconnectTimer !== null) clearTimeout(reconnectTimer)
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }
  updateFeedStatus('prices_ws', 'disconnected')
}

interface CoinGeckoCoin {
  usd?: number
  usd_24h_change?: number
  usd_market_cap?: number
}

export async function fetchTokenDetails(): Promise<Record<string, TokenDetail>> {
  const ids = Object.values(COINGECKO_IDS).join(',')
  return getOrFetch('token_details', async () => {
    const res = await fetch(
      `${API_URLS.COINGECKO}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
    const data = (await res.json()) as Record<string, CoinGeckoCoin>

    const result: Record<string, TokenDetail> = {}
    for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
      const coin = data[geckoId]
      if (coin) {
        result[symbol] = {
          price: coin.usd ?? 0,
          change24h: coin.usd_24h_change ?? 0,
          marketCap: coin.usd_market_cap ?? 0,
        }
      }
    }
    updateFeedStatus('prices_rest', 'live')
    return result
  }, CACHE_TTL.PRICES_REST)
}

export async function fetchPriceHistory(days: number = 90): Promise<PortfolioHistoryEntry[]> {
  return getOrFetch(`price_history_${days}`, async () => {
    const res = await fetch(
      `${API_URLS.COINGECKO}/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`CoinGecko history ${res.status}`)
    const data = (await res.json()) as { prices: [number, number][] }

    return data.prices.map(([ts, price]): PortfolioHistoryEntry => {
      const d = new Date(ts)
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(price),
      }
    })
  }, CACHE_TTL.PRICE_HISTORY)
}
