import type { ReactNode, MouseEventHandler } from 'react'
import type { LucideIcon } from 'lucide-react'

// ── Union Types ──────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Impact = 'bullish' | 'bearish' | 'neutral'
export type OverallStatus = 'live' | 'partial' | 'offline'
export type GasTier = 'low' | 'standard' | 'fast' | 'instant'

export type FeedName = 'prices_ws' | 'prices_rest' | 'gas' | 'whales' | 'threats' | 'defi'
export type FeedStatusValue = 'connected' | 'reconnecting' | 'disconnected' | 'live' | 'cached' | 'error' | 'unknown'
export type FeedStatusMap = Record<FeedName, FeedStatusValue>

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
export type StatCardColor = 'blue' | 'cyan' | 'emerald' | 'amber' | 'red' | 'purple'

// ── Core Entity Types ────────────────────────────────────

export interface Chain {
  name: string
  symbol: string
  color: string
  icon: string
}

export interface PortfolioToken {
  symbol: string
  name: string
  chain: string
  balance: number
  price: number
  change24h: number
  allocation: number
}

export interface DefiPosition {
  protocol: string
  chain: string
  type: string
  supplied: number
  borrowed: number
  healthFactor: number | null
  apy: number
  risk: RiskLevel
  ilLoss?: number
  leverage?: string
}

export interface TokenApproval {
  token: string
  spender: string
  spenderAddr: string
  amount: string
  chain: string
  riskLevel: RiskLevel
  lastUsed: string
  contractVerified: boolean
}

export interface WhaleMovement {
  wallet: string
  action: string
  token: string
  amount: string
  value: string
  chain: string
  time: string
  impact: Impact
}

export interface GasData {
  low: number
  standard: number
  fast: number
  instant: number
  unit: string
  avgTxCost: string
}

export type GasDataRecord = Record<string, GasData>

export interface ThreatToken {
  name: string
  symbol: string
  chain: string
  riskScore: number
  flags: string[]
  holders: number
  liquidityLocked: boolean
  contractAge: string
}

export interface PortfolioHistoryEntry {
  date: string
  value: number
}

export interface GasHistoryEntry {
  hour: string
  ethereum: number
  polygon: number
  arbitrum: number
}

export interface RiskMetrics {
  portfolioVaR: { value: number; confidence: number; period: string }
  sharpeRatio: number
  maxDrawdown: number
  beta: number
  volatility: number
  concentrationRisk: number
  correlationWithBTC: number
  liquidationDistance: number
}

// ── Service Types ────────────────────────────────────────

export interface PriceUpdate {
  symbol: string
  price: number
}

export interface TokenDetail {
  price: number
  change24h: number
  marketCap: number
}

export interface TokenSecurityResult {
  address: string
  safe: boolean
  score: number
  flags: string[]
  holders: number
  name: string
  symbol: string
  chain: string
  liquidityLocked: boolean
  contractAge: string
}

export interface ProtocolData {
  tvl: number
  change1d: number
  change7d: number
  category: string
  chains: string[]
}

export interface YieldData {
  apy: number
  apyBase: number
  apyReward: number
  tvl: number
  pool: string
}

export interface OverallRiskInfo {
  level: string
  color: string
  bg: string
}

export interface CacheEntry<T> {
  data: T
  expiresAt: number
  setAt: number
}

export interface CacheResult<T> {
  data: T
  stale: boolean
}

export interface OwlracleChainConfig {
  slug: string
  unit: string
}

// ── Connection Status UI Types ───────────────────────────

export interface StatusConfig {
  color: string
  label: string
  icon: LucideIcon
}

// ── Component Props ──────────────────────────────────────

export interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

export interface RiskGaugeProps {
  score: number
  size?: number
}

export interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: LucideIcon
  trend?: 'up' | 'down'
  color?: StatCardColor
}

export interface HeaderProps {
  title: string
  subtitle?: string
}

export interface ScoreBarProps {
  score: number
}

export interface Alert {
  type: 'critical' | 'warning' | 'info'
  msg: string
  time: string
}

export interface NavItem {
  path: string
  icon: LucideIcon
  label: string
}

export interface ScanResult {
  address: string
  safe: boolean
  score: number
  flags: string[]
  holders: number
}
