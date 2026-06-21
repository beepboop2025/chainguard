import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  shortenAddress,
  getRiskColor,
  getRiskBg,
  getImpactColor,
  getImpactBg,
} from './formatters'

describe('formatCurrency', () => {
  it('formats billions with B suffix and 2 decimals', () => {
    expect(formatCurrency(2_500_000_000)).toBe('$2.50B')
  })

  it('formats millions with M suffix and 2 decimals', () => {
    expect(formatCurrency(1_750_000)).toBe('$1.75M')
  })

  it('formats thousands with K suffix using the decimals argument', () => {
    expect(formatCurrency(12_345)).toBe('$12.35K')
    expect(formatCurrency(12_345, 0)).toBe('$12K')
  })

  it('formats sub-thousand values with a plain dollar amount', () => {
    expect(formatCurrency(42.5)).toBe('$42.50')
  })

  it('uses the exact boundary thresholds (1000 -> K, 999 -> plain)', () => {
    expect(formatCurrency(1_000)).toBe('$1.00K')
    expect(formatCurrency(999)).toBe('$999.00')
  })

  it('guards against non-finite input', () => {
    expect(formatCurrency(NaN)).toBe('$0.00')
    expect(formatCurrency(Infinity)).toBe('$0.00')
  })
})

describe('formatNumber', () => {
  it('formats millions and thousands with suffixes', () => {
    expect(formatNumber(3_000_000)).toBe('3.00M')
    expect(formatNumber(4_500)).toBe('4.50K')
  })

  it('respects a custom decimals argument', () => {
    expect(formatNumber(4_560, 1)).toBe('4.6K')
  })

  it('formats small numbers without a suffix', () => {
    expect(formatNumber(7)).toBe('7.00')
  })

  it('returns a safe default for non-finite values', () => {
    expect(formatNumber(NaN)).toBe('0.00')
  })
})

describe('formatPercent', () => {
  it('prefixes a + sign for positive values when showSign is on', () => {
    expect(formatPercent(3.5)).toBe('+3.50%')
  })

  it('never adds a sign to negative values', () => {
    expect(formatPercent(-2.1)).toBe('-2.10%')
  })

  it('omits the sign for zero', () => {
    expect(formatPercent(0)).toBe('0.00%')
  })

  it('suppresses the + when showSign is false', () => {
    expect(formatPercent(5, false)).toBe('5.00%')
  })
})

describe('shortenAddress', () => {
  it('keeps the first 6 and last 4 characters', () => {
    expect(shortenAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678')
  })

  it('returns an empty string for falsy input', () => {
    expect(shortenAddress('')).toBe('')
  })
})

describe('risk and impact class helpers', () => {
  it('maps each risk level to a distinct color class', () => {
    expect(getRiskColor('low')).toBe('text-accent-emerald')
    expect(getRiskColor('medium')).toBe('text-accent-amber')
    expect(getRiskColor('high')).toBe('text-accent-red')
    expect(getRiskColor('critical')).toBe('text-red-500')
  })

  it('returns a non-empty background class for every risk level', () => {
    for (const level of ['low', 'medium', 'high', 'critical'] as const) {
      expect(getRiskBg(level).length).toBeGreaterThan(0)
    }
  })

  it('maps impact to color and background classes', () => {
    expect(getImpactColor('bullish')).toBe('text-emerald-400')
    expect(getImpactColor('bearish')).toBe('text-red-400')
    expect(getImpactColor('neutral')).toBe('text-slate-400')
    expect(getImpactBg('bullish')).toBe('bg-emerald-500/10')
    expect(getImpactBg('bearish')).toBe('bg-red-500/10')
  })
})
