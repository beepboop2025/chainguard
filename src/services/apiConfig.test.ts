import { describe, it, expect } from 'vitest'
import {
  COINGECKO_IDS,
  COINGECKO_TO_SYMBOL,
  COINCAP_ASSETS,
  GOPLUS_CHAIN_IDS,
  OWLRACLE_CHAINS,
  CACHE_TTL,
} from './apiConfig'

describe('apiConfig derived maps', () => {
  it('COINGECKO_TO_SYMBOL is the exact inverse of COINGECKO_IDS', () => {
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      expect(COINGECKO_TO_SYMBOL[id]).toBe(symbol)
    }
    expect(Object.keys(COINGECKO_TO_SYMBOL).length).toBe(Object.keys(COINGECKO_IDS).length)
  })

  it('COINCAP_ASSETS is the comma-joined list of coingecko ids', () => {
    expect(COINCAP_ASSETS).toBe(Object.values(COINGECKO_IDS).join(','))
    expect(COINCAP_ASSETS.split(',')).toContain('ethereum')
    expect(COINCAP_ASSETS.split(',')).toContain('bitcoin')
  })

  it('every GoPlus chain id is a numeric string', () => {
    for (const id of Object.values(GOPLUS_CHAIN_IDS)) {
      expect(id).toMatch(/^\d+$/)
    }
    expect(GOPLUS_CHAIN_IDS.ethereum).toBe('1')
    expect(GOPLUS_CHAIN_IDS.bsc).toBe('56')
  })

  it('every Owlracle chain defines a non-empty slug and unit', () => {
    for (const cfg of Object.values(OWLRACLE_CHAINS)) {
      expect(cfg.slug.length).toBeGreaterThan(0)
      expect(cfg.unit.length).toBeGreaterThan(0)
    }
    expect(OWLRACLE_CHAINS.avalanche.unit).toBe('nAVAX')
  })

  it('cache TTLs are positive and gas is the shortest-lived entry', () => {
    for (const ttl of Object.values(CACHE_TTL)) {
      expect(ttl).toBeGreaterThan(0)
    }
    const min = Math.min(...Object.values(CACHE_TTL))
    expect(CACHE_TTL.GAS).toBe(min)
  })
})
