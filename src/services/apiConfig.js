// CoinGecko coin IDs mapped to app token symbols
export const COINGECKO_IDS = {
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

// Reverse map: CoinGecko ID → app symbol
export const COINGECKO_TO_SYMBOL = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([sym, id]) => [id, sym])
)

// CoinCap uses lowercase names as asset IDs
export const COINCAP_ASSETS = Object.values(COINGECKO_IDS).join(',')

// CoinCap asset ID → app symbol
export const COINCAP_TO_SYMBOL = {
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

// Owlracle chain slugs
export const OWLRACLE_CHAINS = {
  ethereum: { slug: 'eth', unit: 'Gwei' },
  bsc: { slug: 'bsc', unit: 'Gwei' },
  polygon: { slug: 'poly', unit: 'Gwei' },
  arbitrum: { slug: 'arb', unit: 'Gwei' },
  avalanche: { slug: 'avax', unit: 'nAVAX' },
  base: { slug: 'base', unit: 'Gwei' },
  // Solana not supported by Owlracle — use mock fallback
}

// GoPlus chain IDs
export const GOPLUS_CHAIN_IDS = {
  ethereum: '1',
  bsc: '56',
  polygon: '137',
  arbitrum: '42161',
  base: '8453',
  avalanche: '43114',
}

// Blockchair chain names
export const BLOCKCHAIR_CHAINS = ['bitcoin', 'ethereum']

export const API_URLS = {
  COINCAP_WS: 'wss://ws.coincap.io/prices',
  COINCAP_REST: 'https://api.coincap.io/v2',
  COINGECKO: 'https://api.coingecko.com/api/v3',
  OWLRACLE: 'https://api.owlracle.info/v4',
  GOPLUS: 'https://api.gopluslabs.io/api/v1',
  DEFILLAMA: 'https://api.llama.fi',
  DEFILLAMA_YIELDS: 'https://yields.llama.fi',
  BLOCKCHAIR: 'https://api.blockchair.com',
}

// Cache TTLs in ms
export const CACHE_TTL = {
  PRICES_REST: 120_000,
  PRICE_HISTORY: 300_000,
  GAS: 15_000,
  GOPLUS: 300_000,
  DEFILLAMA: 120_000,
  WHALES: 300_000,
}
