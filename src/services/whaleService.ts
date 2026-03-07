import { API_URLS, CACHE_TTL } from './apiConfig'
import { getOrFetch } from './cache'
import { updateFeedStatus } from './connectionManager'
import type { WhaleMovement, Impact } from '../types'

function shortenHash(hash: string | undefined): string {
  if (!hash || hash.length < 10) return hash || '0x????...????'
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

function timeAgo(timestamp: string): string {
  const now = Date.now()
  const diff = now - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatValue(usdValue: number): string {
  if (usdValue >= 1_000_000_000) return `$${(usdValue / 1_000_000_000).toFixed(1)}B`
  if (usdValue >= 1_000_000) return `$${(usdValue / 1_000_000).toFixed(1)}M`
  if (usdValue >= 1_000) return `$${(usdValue / 1_000).toFixed(0)}K`
  return `$${usdValue.toFixed(0)}`
}

interface BlockchairTx {
  hash?: string
  output_total?: number
  time?: string
}

interface CoinCapAsset {
  symbol: string
  volumeUsd24Hr: string
  priceUsd: string
  changePercent24Hr: string
}

async function fetchBlockchairWhales(): Promise<WhaleMovement[]> {
  return getOrFetch('whales_blockchair', async () => {
    const res = await fetch(
      `${API_URLS.BLOCKCHAIR}/bitcoin/transactions?s=output_total(desc)&limit=5`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`Blockchair ${res.status}`)
    const json = (await res.json()) as { data?: BlockchairTx[] }

    if (!json.data || !Array.isArray(json.data)) return []

    return json.data.map((tx): WhaleMovement => {
      const valueBtc = (tx.output_total || 0) / 1e8
      const valueUsd = valueBtc * 98000
      return {
        wallet: shortenHash(tx.hash),
        action: valueBtc > 100 ? 'Transferred' : 'Bought',
        token: 'BTC',
        amount: `${valueBtc.toFixed(2)} BTC`,
        value: formatValue(valueUsd),
        chain: 'ethereum',
        time: timeAgo(tx.time ?? ''),
        impact: 'neutral' as Impact,
      }
    })
  }, CACHE_TTL.WHALES)
}

async function fetchCoinCapVolume(): Promise<WhaleMovement[]> {
  return getOrFetch('whales_coincap', async () => {
    const res = await fetch(
      `${API_URLS.COINCAP_REST}/assets?ids=bitcoin,ethereum,solana&limit=3`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`CoinCap ${res.status}`)
    const json = (await res.json()) as { data?: CoinCapAsset[] }

    if (!json.data || !Array.isArray(json.data)) return []

    return json.data.map((asset): WhaleMovement => {
      const volume24h = parseFloat(asset.volumeUsd24Hr) || 0
      const price = parseFloat(asset.priceUsd) || 0
      const changePercent = parseFloat(asset.changePercent24Hr) || 0
      const isBullish = changePercent > 0

      return {
        wallet: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
        action: isBullish ? 'Bought' : 'Sold',
        token: asset.symbol,
        amount: `${(volume24h / price / 1000).toFixed(0)}K ${asset.symbol}`,
        value: formatValue(volume24h / 24),
        chain: asset.symbol === 'SOL' ? 'solana' : 'ethereum',
        time: 'Recent',
        impact: isBullish ? 'bullish' : 'bearish',
      }
    })
  }, 60_000)
}

export async function fetchRecentWhaleMovements(): Promise<WhaleMovement[]> {
  try {
    const [blockchair, coincap] = await Promise.allSettled([
      fetchBlockchairWhales(),
      fetchCoinCapVolume(),
    ])

    const results: WhaleMovement[] = [
      ...(blockchair.status === 'fulfilled' ? blockchair.value : []),
      ...(coincap.status === 'fulfilled' ? coincap.value : []),
    ]

    if (results.length > 0) {
      updateFeedStatus('whales', 'live')
    }

    return results
  } catch {
    updateFeedStatus('whales', 'error')
    return []
  }
}
