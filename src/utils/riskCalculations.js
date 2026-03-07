export function calculatePortfolioValue(tokens) {
  return tokens.reduce((sum, t) => sum + t.balance * t.price, 0)
}

export function calculateRiskScore(positions, approvals) {
  let score = 100

  // Deduct for high-risk positions
  positions.forEach(p => {
    if (p.risk === 'high') score -= 6
    if (p.risk === 'medium') score -= 3
    if (p.healthFactor && p.healthFactor < 1.5) score -= 8
  })

  // Deduct for dangerous approvals
  approvals.forEach(a => {
    if (a.riskLevel === 'critical') score -= 10
    if (a.riskLevel === 'high') score -= 5
    if (a.amount === 'Unlimited' && !a.contractVerified) score -= 4
  })

  return Math.max(0, Math.min(100, score))
}

export function getOverallRiskLevel(score) {
  if (score >= 80) return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15' }
  if (score >= 60) return { level: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/15' }
  if (score >= 40) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/15' }
  return { level: 'Critical', color: 'text-red-400', bg: 'bg-red-500/15' }
}

export function calculateConcentrationRisk(tokens) {
  const total = tokens.reduce((sum, t) => sum + t.allocation, 0)
  const hhi = tokens.reduce((sum, t) => sum + Math.pow((t.allocation / total) * 100, 2), 0)
  return Math.min(100, hhi / 100)
}

export function calculateVaR(portfolioValue, volatility, confidence = 0.95) {
  const zScore = confidence === 0.99 ? 2.326 : 1.645
  return -(portfolioValue * (volatility / 100) * zScore) / Math.sqrt(365)
}
