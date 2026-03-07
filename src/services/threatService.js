import { API_URLS, GOPLUS_CHAIN_IDS, CACHE_TTL } from './apiConfig'
import { getOrFetch } from './cache'
import { updateFeedStatus } from './connectionManager'

// Map GoPlus chain string to our app chain name
const CHAIN_ID_TO_NAME = Object.fromEntries(
  Object.entries(GOPLUS_CHAIN_IDS).map(([name, id]) => [id, name])
)

export async function scanToken(chainId, contractAddress) {
  const addr = contractAddress.toLowerCase().trim()
  const cacheKey = `goplus_${chainId}_${addr}`

  return getOrFetch(cacheKey, async () => {
    const res = await fetch(
      `${API_URLS.GOPLUS}/token_security/${chainId}?contract_addresses=${addr}`,
      { signal: AbortSignal.timeout(15000) }
    )
    if (!res.ok) throw new Error(`GoPlus ${res.status}`)
    const json = await res.json()

    if (json.code !== 1 || !json.result || !json.result[addr]) {
      throw new Error('Token not found or invalid response')
    }

    const token = json.result[addr]
    updateFeedStatus('threats', 'live')
    return transformGoPlusResult(token, addr, chainId)
  }, CACHE_TTL.GOPLUS)
}

function transformGoPlusResult(token, address, chainId) {
  const flags = []
  let riskScore = 0

  // Honeypot detection
  if (token.is_honeypot === '1') {
    flags.push('Honeypot')
    riskScore += 30
  }

  // Mintable (hidden mint)
  if (token.is_mintable === '1') {
    flags.push('Hidden Mint')
    riskScore += 20
  }

  // Owner not renounced
  if (token.can_take_back_ownership === '1' || token.owner_address !== '') {
    flags.push('Owner Not Renounced')
    riskScore += 10
  }

  // Proxy contract
  if (token.is_proxy === '1') {
    flags.push('Proxy Contract')
    riskScore += 10
  }

  // High tax
  const buyTax = parseFloat(token.buy_tax) || 0
  const sellTax = parseFloat(token.sell_tax) || 0
  const maxTax = Math.max(buyTax, sellTax) * 100
  if (maxTax > 10) {
    flags.push(`High Tax (${maxTax.toFixed(0)}%)`)
    riskScore += Math.min(25, maxTax / 2)
  }

  // Blacklist function
  if (token.is_blacklisted === '1') {
    flags.push('Blacklist Function')
    riskScore += 10
  }

  // Not open source / no audit
  if (token.is_open_source === '0') {
    flags.push('No Audit')
    riskScore += 15
  }

  // Anti-whale (can modify max tx)
  if (token.is_anti_whale === '1') {
    flags.push('Anti-Whale Modifier')
    riskScore += 5
  }

  // Positive signals (reduce score)
  if (flags.length === 0) {
    if (token.is_open_source === '1') flags.push('Contract Verified')
    if (token.lp_holders && token.lp_holders.length > 0) {
      const locked = token.lp_holders.some(h => h.is_locked === 1)
      if (locked) flags.push('Liquidity Locked')
    }
    if (token.owner_address === '' || token.can_take_back_ownership === '0') {
      flags.push('Owner Renounced')
    }
  }

  riskScore = Math.min(100, Math.max(0, Math.round(riskScore)))

  return {
    address,
    safe: riskScore < 40,
    score: riskScore,
    flags,
    holders: parseInt(token.holder_count) || 0,
    name: token.token_name || 'Unknown',
    symbol: token.token_symbol || '???',
    chain: CHAIN_ID_TO_NAME[chainId] || 'ethereum',
    liquidityLocked: token.lp_holders?.some(h => h.is_locked === 1) ?? false,
    contractAge: 'Unknown',
  }
}

// Detect chain from contract address format or user input
export function detectChainId(input) {
  const lower = input.toLowerCase()
  if (lower.startsWith('0x')) return '1' // Default to Ethereum
  // Could add Solana base58 detection etc.
  return '1'
}
