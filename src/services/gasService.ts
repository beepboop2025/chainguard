import { API_URLS, OWLRACLE_CHAINS, CACHE_TTL } from './apiConfig'
import { getOrFetch } from './cache'
import { updateFeedStatus } from './connectionManager'
import { GAS_DATA } from '../data/mockData'
import type { GasData, GasDataRecord, GasHistoryEntry } from '../types'

const gasHistory: GasHistoryEntry[] = []

interface OwlracleSpeed {
  maxFeePerGas?: number
  gasPrice?: number
}

export async function fetchAllChainGas(ethPrice: number = 3800): Promise<GasDataRecord> {
  const results: GasDataRecord = {}
  const chains = Object.entries(OWLRACLE_CHAINS)

  const fetches = chains.map(([chain, { slug, unit }]) =>
    getOrFetch<GasData>(`gas_${chain}`, async () => {
      const res = await fetch(
        `${API_URLS.OWLRACLE}/${slug}/gas`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (!res.ok) throw new Error(`Owlracle ${chain} ${res.status}`)
      const data = (await res.json()) as { error?: boolean; speeds?: OwlracleSpeed[] }

      if (data.error || !data.speeds || data.speeds.length < 4) {
        throw new Error(`Owlracle invalid response for ${chain}`)
      }

      const speeds = data.speeds
      const getGas = (s: OwlracleSpeed): number => s?.maxFeePerGas ?? s?.gasPrice ?? 0
      const standard = getGas(speeds[1]) || getGas(speeds[0])
      const avgCostWei = standard * 21000 * 1e-9
      const avgCostUsd = chain === 'ethereum'
        ? avgCostWei * ethPrice
        : avgCostWei * (ethPrice / 20)

      return {
        low: +(getGas(speeds[0])).toFixed(2),
        standard: +(getGas(speeds[1]) || getGas(speeds[0])).toFixed(2),
        fast: +(getGas(speeds[2]) || getGas(speeds[1])).toFixed(2),
        instant: +(getGas(speeds[3]) || getGas(speeds[2])).toFixed(2),
        unit,
        avgTxCost: `$${avgCostUsd.toFixed(2)}`,
      }
    }, CACHE_TTL.GAS).catch((): null => null)
  )

  const settled = await Promise.all(fetches)

  chains.forEach(([chain], i) => {
    results[chain] = settled[i] ?? GAS_DATA[chain]
  })

  results.solana = GAS_DATA.solana

  const realCount = settled.filter(Boolean).length
  updateFeedStatus('gas', realCount > 0 ? 'live' : 'error')

  if (realCount > 0) {
    const hour = `${new Date().getHours()}:00`
    gasHistory.push({
      hour,
      ethereum: results.ethereum?.standard ?? 0,
      polygon: results.polygon?.standard ?? 0,
      arbitrum: results.arbitrum?.standard ?? 0,
    })
    if (gasHistory.length > 96) gasHistory.shift()
  }

  return results
}

export function getGasHistory(): GasHistoryEntry[] | null {
  return gasHistory.length > 0 ? gasHistory : null
}
