import type { OwlracleChainConfig } from '../types'

export const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  SOL: 'solana',
  ARB: 'arbitrum',
  AAVE: 'aave',
  UNI: 'uniswap',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  OP: 'optimism',
}

export const COINGECKO_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([sym, id]) => [id, sym])
)

export const COINCAP_ASSETS: string = Object.values(COINGECKO_IDS).join(',')

export const COINCAP_TO_SYMBOL: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  arbitrum: 'ARB',
  aave: 'AAVE',
  uniswap: 'UNI',
  chainlink: 'LINK',
  'matic-network': 'MATIC',
  'avalanche-2': 'AVAX',
  optimism: 'OP',
}

export const OWLRACLE_CHAINS: Record<string, OwlracleChainConfig> = {
  ethereum: { slug: 'eth', unit: 'Gwei' },
  bsc: { slug: 'bsc', unit: 'Gwei' },
  polygon: { slug: 'poly', unit: 'Gwei' },
  arbitrum: { slug: 'arb', unit: 'Gwei' },
  avalanche: { slug: 'avax', unit: 'nAVAX' },
  base: { slug: 'base', unit: 'Gwei' },
}

export const GOPLUS_CHAIN_IDS: Record<string, string> = {
  ethereum: '1',
  bsc: '56',
  polygon: '137',
  arbitrum: '42161',
  base: '8453',
  avalanche: '43114',
}

export const BLOCKCHAIR_CHAINS: string[] = ['bitcoin', 'ethereum']

export const API_URLS = {
  COINCAP_WS: 'wss://ws.coincap.io/prices',
  COINCAP_REST: 'https://api.coincap.io/v2',
  COINGECKO: 'https://api.coingecko.com/api/v3',
  OWLRACLE: 'https://api.owlracle.info/v4',
  GOPLUS: 'https://api.gopluslabs.io/api/v1',
  DEFILLAMA: 'https://api.llama.fi',
  DEFILLAMA_YIELDS: 'https://yields.llama.fi',
  BLOCKCHAIR: 'https://api.blockchair.com',
} as const

export const CACHE_TTL = {
  PRICES_REST: 120_000,
  PRICE_HISTORY: 300_000,
  GAS: 15_000,
  GOPLUS: 300_000,
  DEFILLAMA: 120_000,
  WHALES: 300_000,
} as const
