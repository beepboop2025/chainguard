export function formatCurrency(value, decimals = 2) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(decimals)}K`
  return `$${value.toFixed(decimals)}`
}

export function formatNumber(value, decimals = 2) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`
  return value.toFixed(decimals)
}

export function formatPercent(value, showSign = true) {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function shortenAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function getRiskColor(level) {
  const colors = {
    low: 'text-accent-emerald',
    medium: 'text-accent-amber',
    high: 'text-accent-red',
    critical: 'text-red-500',
  }
  return colors[level] || 'text-text-secondary'
}

export function getRiskBg(level) {
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    critical: 'bg-red-600/15 text-red-400 border-red-500/30',
  }
  return colors[level] || ''
}

export function getImpactColor(impact) {
  const colors = {
    bullish: 'text-emerald-400',
    bearish: 'text-red-400',
    neutral: 'text-slate-400',
  }
  return colors[impact] || 'text-slate-400'
}

export function getImpactBg(impact) {
  const colors = {
    bullish: 'bg-emerald-500/10',
    bearish: 'bg-red-500/10',
    neutral: 'bg-slate-500/10',
  }
  return colors[impact] || 'bg-slate-500/10'
}
