import { API_URLS, CACHE_TTL } from './apiConfig'
import { getOrFetch } from './cache'
import { updateFeedStatus } from './connectionManager'
import type { ProtocolData, YieldData } from '../types'

const PROTOCOL_MAP: Record<string, string> = {
  'Aave V3': 'aave',
  'Uniswap V3': 'uniswap',
  'GMX': 'gmx',
  'Lido': 'lido',
  'Curve': 'curve-dex',
  'Compound V3': 'compound-finance',
}

interface DefiLlamaProtocol {
  slug: string
  tvl?: number
  change_1d?: number
  change_7d?: number
  category?: string
  chains?: string[]
}

interface DefiLlamaPool {
  project: string
  chain: string
  apy?: number
  apyBase?: number
  apyReward?: number
  tvlUsd?: number
  symbol?: string
}

export async function fetchProtocolData(): Promise<Record<string, ProtocolData>> {
  return getOrFetch('defillama_protocols', async () => {
    const res = await fetch(
      `${API_URLS.DEFILLAMA}/protocols`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`DefiLlama ${res.status}`)
    const protocols = (await res.json()) as DefiLlamaProtocol[]

    const result: Record<string, ProtocolData> = {}
    for (const [appName, llamaSlug] of Object.entries(PROTOCOL_MAP)) {
      const match = protocols.find(p => p.slug === llamaSlug)
      if (match) {
        result[appName] = {
          tvl: match.tvl ?? 0,
          change1d: match.change_1d ?? 0,
          change7d: match.change_7d ?? 0,
          category: match.category ?? 'Unknown',
          chains: match.chains ?? [],
        }
      }
    }

    updateFeedStatus('defi', 'live')
    return result
  }, CACHE_TTL.DEFILLAMA)
}

export async function fetchYieldData(): Promise<Record<string, YieldData>> {
  return getOrFetch('defillama_yields', async () => {
    const res = await fetch(
      `${API_URLS.DEFILLAMA_YIELDS}/pools`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`DefiLlama yields ${res.status}`)
    const json = (await res.json()) as { data?: DefiLlamaPool[] }
    const pools = json.data ?? []

    const result: Record<string, YieldData> = {}
    for (const [appName, llamaSlug] of Object.entries(PROTOCOL_MAP)) {
      const matching = pools.filter(p =>
        p.project === llamaSlug && p.chain === 'Ethereum'
      )
      if (matching.length > 0) {
        const best = matching.sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))[0]
        result[appName] = {
          apy: best.apy ?? 0,
          apyBase: best.apyBase ?? 0,
          apyReward: best.apyReward ?? 0,
          tvl: best.tvlUsd ?? 0,
          pool: best.symbol ?? '',
        }
      }
    }

    return result
  }, CACHE_TTL.DEFILLAMA)
}
