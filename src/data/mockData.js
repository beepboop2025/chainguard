// Simulated real-time data for the DeFi Risk Intelligence platform

export const CHAINS = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: '⟠' },
  bsc: { name: 'BNB Chain', symbol: 'BNB', color: '#F3BA2F', icon: '◆' },
  polygon: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: '⬡' },
  arbitrum: { name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0', icon: '◈' },
  solana: { name: 'Solana', symbol: 'SOL', color: '#14F195', icon: '◎' },
  base: { name: 'Base', symbol: 'BASE', color: '#0052FF', icon: '▣' },
  avalanche: { name: 'Avalanche', symbol: 'AVAX', color: '#E84142', icon: '▲' },
}

export const PORTFOLIO_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum', balance: 12.45, price: 3842.50, change24h: 2.34, allocation: 35.2 },
  { symbol: 'BTC', name: 'Bitcoin', chain: 'ethereum', balance: 0.85, price: 98420.00, change24h: 1.12, allocation: 25.8 },
  { symbol: 'SOL', name: 'Solana', chain: 'solana', balance: 145.3, price: 187.20, change24h: -3.45, allocation: 10.1 },
  { symbol: 'ARB', name: 'Arbitrum', chain: 'arbitrum', balance: 8500, price: 1.23, change24h: 5.67, allocation: 7.7 },
  { symbol: 'AAVE', name: 'Aave', chain: 'ethereum', balance: 42, price: 285.40, change24h: 0.89, allocation: 5.5 },
  { symbol: 'UNI', name: 'Uniswap', chain: 'ethereum', balance: 320, price: 14.85, change24h: -1.23, allocation: 3.5 },
  { symbol: 'LINK', name: 'Chainlink', chain: 'ethereum', balance: 580, price: 18.92, change24h: 3.21, allocation: 4.1 },
  { symbol: 'MATIC', name: 'Polygon', chain: 'polygon', balance: 15000, price: 0.72, change24h: -0.45, allocation: 4.0 },
  { symbol: 'AVAX', name: 'Avalanche', chain: 'avalanche', balance: 120, price: 42.30, change24h: 1.87, allocation: 3.1 },
  { symbol: 'OP', name: 'Optimism', chain: 'ethereum', balance: 2200, price: 2.15, change24h: -2.10, allocation: 1.0 },
]

export const DEFI_POSITIONS = [
  { protocol: 'Aave V3', chain: 'ethereum', type: 'Lending', supplied: 45000, borrowed: 18000, healthFactor: 1.82, apy: 3.2, risk: 'low' },
  { protocol: 'Uniswap V3', chain: 'ethereum', type: 'LP', supplied: 22000, borrowed: 0, healthFactor: null, apy: 18.5, risk: 'medium', ilLoss: -2.3 },
  { protocol: 'GMX', chain: 'arbitrum', type: 'Perps', supplied: 15000, borrowed: 0, healthFactor: null, apy: 12.4, risk: 'high', leverage: '3x' },
  { protocol: 'Lido', chain: 'ethereum', type: 'Staking', supplied: 38000, borrowed: 0, healthFactor: null, apy: 3.8, risk: 'low' },
  { protocol: 'Curve', chain: 'ethereum', type: 'LP', supplied: 12000, borrowed: 0, healthFactor: null, apy: 8.2, risk: 'low', ilLoss: -0.5 },
  { protocol: 'Compound V3', chain: 'base', type: 'Lending', supplied: 8000, borrowed: 3500, healthFactor: 2.15, apy: 4.1, risk: 'low' },
]

export const TOKEN_APPROVALS = [
  { token: 'USDC', spender: 'Uniswap V3 Router', spenderAddr: '0x68b3...f4a2', amount: 'Unlimited', chain: 'ethereum', riskLevel: 'high', lastUsed: '2 hours ago', contractVerified: true },
  { token: 'WETH', spender: 'Aave V3 Pool', spenderAddr: '0x87d1...3e5c', amount: '50 WETH', chain: 'ethereum', riskLevel: 'low', lastUsed: '1 day ago', contractVerified: true },
  { token: 'DAI', spender: 'Unknown Contract', spenderAddr: '0x3f2a...9d1b', amount: 'Unlimited', chain: 'ethereum', riskLevel: 'critical', lastUsed: '45 days ago', contractVerified: false },
  { token: 'LINK', spender: 'SushiSwap Router', spenderAddr: '0x1b02...e2c8', amount: 'Unlimited', chain: 'ethereum', riskLevel: 'medium', lastUsed: '5 days ago', contractVerified: true },
  { token: 'USDT', spender: 'Curve Finance', spenderAddr: '0xbebc...20d8', amount: '100,000 USDT', chain: 'ethereum', riskLevel: 'low', lastUsed: '3 hours ago', contractVerified: true },
  { token: 'ARB', spender: 'GMX Router', spenderAddr: '0xabd2...7f11', amount: 'Unlimited', chain: 'arbitrum', riskLevel: 'medium', lastUsed: '12 hours ago', contractVerified: true },
  { token: 'SOL', spender: 'Raydium AMM', spenderAddr: '0x72a1...b8e3', amount: 'Unlimited', chain: 'solana', riskLevel: 'medium', lastUsed: '2 days ago', contractVerified: true },
  { token: 'WBTC', spender: 'Suspicious DEX', spenderAddr: '0x9e4c...1a7d', amount: 'Unlimited', chain: 'ethereum', riskLevel: 'critical', lastUsed: '30 days ago', contractVerified: false },
]

export const WHALE_MOVEMENTS = [
  { wallet: '0x28c6...e9a1', action: 'Bought', token: 'ETH', amount: '5,200 ETH', value: '$19.98M', chain: 'ethereum', time: '2 min ago', impact: 'bullish' },
  { wallet: '0x3f8e...b2d4', action: 'Sold', token: 'SOL', amount: '125,000 SOL', value: '$23.4M', chain: 'solana', time: '8 min ago', impact: 'bearish' },
  { wallet: '0x7c2a...f1e3', action: 'Transferred', token: 'USDC', amount: '50M USDC', value: '$50M', chain: 'ethereum', time: '15 min ago', impact: 'neutral' },
  { wallet: '0x1d5b...a4c7', action: 'Bought', token: 'ARB', amount: '8.5M ARB', value: '$10.45M', chain: 'arbitrum', time: '22 min ago', impact: 'bullish' },
  { wallet: '0x9e3f...d2a8', action: 'Deposited', token: 'ETH', amount: '3,100 ETH', value: '$11.9M', chain: 'ethereum', time: '35 min ago', impact: 'neutral' },
  { wallet: '0x5a7c...e1b9', action: 'Sold', token: 'LINK', amount: '2.1M LINK', value: '$39.7M', chain: 'ethereum', time: '42 min ago', impact: 'bearish' },
  { wallet: '0x4d2e...c8f5', action: 'Bought', token: 'AAVE', amount: '85,000 AAVE', value: '$24.26M', chain: 'ethereum', time: '1 hr ago', impact: 'bullish' },
  { wallet: '0x8b1a...d3e6', action: 'Transferred', token: 'BTC', amount: '450 BTC', value: '$44.29M', chain: 'ethereum', time: '1.5 hr ago', impact: 'neutral' },
]

export const GAS_DATA = {
  ethereum: { low: 12, standard: 18, fast: 25, instant: 35, unit: 'Gwei', avgTxCost: '$4.82' },
  bsc: { low: 3, standard: 5, fast: 7, instant: 10, unit: 'Gwei', avgTxCost: '$0.15' },
  polygon: { low: 30, standard: 45, fast: 80, instant: 120, unit: 'Gwei', avgTxCost: '$0.02' },
  arbitrum: { low: 0.1, standard: 0.1, fast: 0.15, instant: 0.2, unit: 'Gwei', avgTxCost: '$0.28' },
  solana: { low: 0.000005, standard: 0.000005, fast: 0.00001, instant: 0.00005, unit: 'SOL', avgTxCost: '$0.001' },
  base: { low: 0.05, standard: 0.08, fast: 0.12, instant: 0.18, unit: 'Gwei', avgTxCost: '$0.05' },
  avalanche: { low: 25, standard: 30, fast: 40, instant: 60, unit: 'nAVAX', avgTxCost: '$0.08' },
}

export const THREAT_TOKENS = [
  { name: 'SafeMoon3.0', symbol: 'SFM3', chain: 'bsc', riskScore: 95, flags: ['Honeypot', 'Hidden Mint', 'No Audit'], holders: 1245, liquidityLocked: false, contractAge: '2 days' },
  { name: 'ElonDogAI', symbol: 'EDAI', chain: 'ethereum', riskScore: 88, flags: ['High Tax (45%)', 'Proxy Contract', 'Owner Not Renounced'], holders: 3420, liquidityLocked: false, contractAge: '5 days' },
  { name: 'MetaYield', symbol: 'MYD', chain: 'bsc', riskScore: 78, flags: ['Blacklist Function', 'Mutable Tax'], holders: 8900, liquidityLocked: true, contractAge: '12 days' },
  { name: 'CryptoPhoenix', symbol: 'CPNX', chain: 'ethereum', riskScore: 65, flags: ['Proxy Contract', 'Low Liquidity'], holders: 15600, liquidityLocked: true, contractAge: '30 days' },
  { name: 'AITradeBot', symbol: 'AITB', chain: 'solana', riskScore: 92, flags: ['Freeze Authority', 'No LP Lock', 'Anonymous Team'], holders: 890, liquidityLocked: false, contractAge: '1 day' },
  { name: 'YieldMax Pro', symbol: 'YMP', chain: 'arbitrum', riskScore: 72, flags: ['High Tax (18%)', 'Owner Not Renounced'], holders: 5670, liquidityLocked: true, contractAge: '21 days' },
]

export const PORTFOLIO_HISTORY = Array.from({ length: 90 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (89 - i))
  const base = 180000
  const trend = i * 800
  const noise = (Math.random() - 0.5) * 15000
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.round(base + trend + noise),
  }
})

export const RISK_METRICS = {
  portfolioVaR: { value: -8.2, confidence: 95, period: '1 day' },
  sharpeRatio: 1.45,
  maxDrawdown: -18.3,
  beta: 1.12,
  volatility: 42.5,
  concentrationRisk: 61,
  correlationWithBTC: 0.82,
  liquidationDistance: 45,
}

export const GAS_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  ethereum: Math.round(10 + Math.random() * 40),
  polygon: Math.round(20 + Math.random() * 100),
  arbitrum: +(0.05 + Math.random() * 0.2).toFixed(2),
}))
