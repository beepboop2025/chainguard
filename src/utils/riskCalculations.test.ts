import { describe, it, expect } from 'vitest'
import {
  calculatePortfolioValue,
  calculateRiskScore,
  getOverallRiskLevel,
  calculateConcentrationRisk,
  calculateVaR,
} from './riskCalculations'
import type { PortfolioToken, DefiPosition, TokenApproval } from '../types'

function token(over: Partial<PortfolioToken>): PortfolioToken {
  return {
    symbol: 'X',
    name: 'X',
    chain: 'ethereum',
    balance: 0,
    price: 0,
    change24h: 0,
    allocation: 0,
    ...over,
  }
}

function position(over: Partial<DefiPosition>): DefiPosition {
  return {
    protocol: 'Aave',
    chain: 'ethereum',
    type: 'lending',
    supplied: 0,
    borrowed: 0,
    healthFactor: null,
    apy: 0,
    risk: 'low',
    ...over,
  }
}

function approval(over: Partial<TokenApproval>): TokenApproval {
  return {
    token: 'USDC',
    spender: 'Uniswap',
    spenderAddr: '0xabc',
    amount: '100',
    chain: 'ethereum',
    riskLevel: 'low',
    lastUsed: 'today',
    contractVerified: true,
    ...over,
  }
}

describe('calculatePortfolioValue', () => {
  it('sums balance * price across tokens', () => {
    const value = calculatePortfolioValue([
      token({ balance: 2, price: 1500 }),
      token({ balance: 10, price: 30 }),
    ])
    expect(value).toBe(3300)
  })

  it('returns 0 for an empty portfolio', () => {
    expect(calculatePortfolioValue([])).toBe(0)
  })
})

describe('calculateRiskScore', () => {
  it('starts at 100 with no positions or approvals', () => {
    expect(calculateRiskScore([], [])).toBe(100)
  })

  it('subtracts 6 for a high-risk position', () => {
    expect(calculateRiskScore([position({ risk: 'high' })], [])).toBe(94)
  })

  it('subtracts 3 for a medium-risk position', () => {
    expect(calculateRiskScore([position({ risk: 'medium' })], [])).toBe(97)
  })

  it('subtracts an additional 8 for a low health factor', () => {
    // high risk (-6) AND healthFactor < 1.5 (-8) => 100 - 14
    expect(calculateRiskScore([position({ risk: 'high', healthFactor: 1.2 })], [])).toBe(86)
  })

  it('does not penalize a healthy health factor', () => {
    expect(calculateRiskScore([position({ risk: 'low', healthFactor: 2.0 })], [])).toBe(100)
  })

  it('subtracts 10 for a critical approval', () => {
    expect(calculateRiskScore([], [approval({ riskLevel: 'critical' })])).toBe(90)
  })

  it('penalizes unlimited approvals to unverified contracts', () => {
    // high (-5) AND unlimited+unverified (-4) => 100 - 9
    expect(
      calculateRiskScore([], [approval({ riskLevel: 'high', amount: 'Unlimited', contractVerified: false })]),
    ).toBe(91)
  })

  it('does not apply the unlimited penalty when the contract is verified', () => {
    expect(
      calculateRiskScore([], [approval({ riskLevel: 'low', amount: 'Unlimited', contractVerified: true })]),
    ).toBe(100)
  })

  it('clamps the score to a minimum of 0', () => {
    const manyCritical = Array.from({ length: 20 }, () => approval({ riskLevel: 'critical' }))
    expect(calculateRiskScore([], manyCritical)).toBe(0)
  })
})

describe('getOverallRiskLevel', () => {
  it('classifies scores into Low/Medium/High/Critical bands', () => {
    expect(getOverallRiskLevel(95).level).toBe('Low')
    expect(getOverallRiskLevel(70).level).toBe('Medium')
    expect(getOverallRiskLevel(50).level).toBe('High')
    expect(getOverallRiskLevel(10).level).toBe('Critical')
  })

  it('uses inclusive lower boundaries (80, 60, 40)', () => {
    expect(getOverallRiskLevel(80).level).toBe('Low')
    expect(getOverallRiskLevel(60).level).toBe('Medium')
    expect(getOverallRiskLevel(40).level).toBe('High')
    expect(getOverallRiskLevel(39).level).toBe('Critical')
  })

  it('returns matching color and bg classes for each band', () => {
    const info = getOverallRiskLevel(95)
    expect(info.color).toContain('emerald')
    expect(info.bg).toContain('emerald')
  })
})

describe('calculateConcentrationRisk', () => {
  it('returns 0 when total allocation is 0', () => {
    expect(calculateConcentrationRisk([token({ allocation: 0 }), token({ allocation: 0 })])).toBe(0)
  })

  it('returns the maximum 100 for a fully concentrated single holding', () => {
    // single token: share is 100%, hhi = 100^2 = 10000, /100 = 100
    expect(calculateConcentrationRisk([token({ allocation: 50 })])).toBe(100)
  })

  it('yields a lower score for a perfectly diversified portfolio', () => {
    // four equal holdings: each 25%, hhi = 4 * 25^2 = 2500, /100 = 25
    const equal = Array.from({ length: 4 }, () => token({ allocation: 25 }))
    expect(calculateConcentrationRisk(equal)).toBeCloseTo(25, 5)
  })

  it('normalizes regardless of absolute allocation magnitudes', () => {
    // two equal holdings expressed as 10/10 vs 50/50 produce identical HHI
    const a = calculateConcentrationRisk([token({ allocation: 10 }), token({ allocation: 10 })])
    const b = calculateConcentrationRisk([token({ allocation: 50 }), token({ allocation: 50 })])
    expect(a).toBeCloseTo(b, 10)
    expect(a).toBeCloseTo(50, 5) // 2 * 50^2 / 100
  })
})

describe('calculateVaR', () => {
  it('is negative (a loss) for a positive volatility', () => {
    expect(calculateVaR(100_000, 20)).toBeLessThan(0)
  })

  it('uses the 95% z-score (1.645) by default', () => {
    const expected = -(100_000 * (20 / 100) * 1.645) / Math.sqrt(365)
    expect(calculateVaR(100_000, 20)).toBeCloseTo(expected, 6)
  })

  it('uses a larger z-score (2.326) at 99% confidence, producing a deeper loss', () => {
    const v95 = calculateVaR(100_000, 20, 0.95)
    const v99 = calculateVaR(100_000, 20, 0.99)
    expect(v99).toBeLessThan(v95)
    const expected99 = -(100_000 * (20 / 100) * 2.326) / Math.sqrt(365)
    expect(v99).toBeCloseTo(expected99, 6)
  })

  it('scales linearly with portfolio value', () => {
    expect(calculateVaR(200_000, 20)).toBeCloseTo(2 * calculateVaR(100_000, 20), 6)
  })
})
