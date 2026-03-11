import { useState, useEffect, useCallback, useRef } from 'react'
import { connectPriceWebSocket, fetchTokenDetails } from '../services/priceService'
import { fetchAllChainGas } from '../services/gasService'
import { fetchRecentWhaleMovements } from '../services/whaleService'
import type { PortfolioToken, GasDataRecord, WhaleMovement, Impact } from '../types'

// Real-time token prices via CoinCap WebSocket + CoinGecko REST for 24h change
export function useLiveData(initialData: PortfolioToken[], _interval = 3000): PortfolioToken[] {
  const [data, setData] = useState<PortfolioToken[]>(initialData)
  const latestEthPrice = useRef(initialData.find(t => t.symbol === 'ETH')?.price ?? 3800)

  useEffect(() => {
    // 1. Connect CoinCap WebSocket for real-time streaming prices
    const unsubscribe = connectPriceWebSocket(({ symbol, price }) => {
      if (symbol === 'ETH') latestEthPrice.current = price
      setData(prev => prev.map(token =>
        token.symbol === symbol ? { ...token, price } : token
      ))
    })

    // 2. Fetch 24h change data from CoinGecko REST (respecting rate limits)
    const fetchDetails = async () => {
      try {
        const details = await fetchTokenDetails()
        setData(prev => prev.map(token => {
          const detail = details[token.symbol]
          if (detail) {
            return {
              ...token,
              price: detail.price || token.price,
              change24h: detail.change24h ?? token.change24h,
            }
          }
          return token
        }))
      } catch {
        // Silently fall back — data stays as-is (stale or mock)
      }
    }

    fetchDetails()
    const restTimer = setInterval(fetchDetails, 120_000) // Every 2 min (CoinGecko rate limit safe)

    return () => {
      unsubscribe()
      clearInterval(restTimer)
    }
  }, [])

  return data
}

// Real gas prices from Owlracle, polling every 15s
export function useLiveGas(initialData: GasDataRecord, interval = 5000): GasDataRecord {
  const [data, setData] = useState<GasDataRecord>(initialData)

  useEffect(() => {
    const fetchGas = async () => {
      try {
        const gasData = await fetchAllChainGas()
        setData(gasData)
      } catch {
        // Keep previous data on failure
      }
    }

    fetchGas()
    const timer = setInterval(fetchGas, Math.max(interval, 15_000)) // min 15s
    return () => clearInterval(timer)
  }, [interval])

  return data
}

const WHALE_TOKENS = ['ETH', 'BTC', 'SOL', 'ARB', 'LINK', 'AAVE', 'UNI', 'AVAX']
const WHALE_ACTIONS = ['Bought', 'Sold', 'Transferred', 'Deposited', 'Withdrawn']
const WHALE_IMPACTS: Impact[] = ['bullish', 'bearish', 'neutral']
const WHALE_CHAINS = ['ethereum', 'solana', 'arbitrum', 'base', 'polygon']

// Whale movements: real API data blended with simulated movements
export function useLiveWhale(initialData: WhaleMovement[], interval = 8000): WhaleMovement[] {
  const [data, setData] = useState<WhaleMovement[]>(initialData)

  // Keep simulated generator as fallback / filler between real data
  const generateMovement = useCallback((): WhaleMovement => {
    const token = WHALE_TOKENS[Math.floor(Math.random() * WHALE_TOKENS.length)]
    const action = WHALE_ACTIONS[Math.floor(Math.random() * WHALE_ACTIONS.length)]
    const value = Math.round(Math.random() * 50 + 5)
    const hash = Math.random().toString(16).slice(2, 6)
    const hash2 = Math.random().toString(16).slice(2, 6)
    return {
      wallet: `0x${hash}...${hash2}`,
      action,
      token,
      amount: `${(Math.random() * 10000 + 100).toFixed(0)} ${token}`,
      value: `$${value}M`,
      chain: WHALE_CHAINS[Math.floor(Math.random() * WHALE_CHAINS.length)],
      time: 'Just now',
      impact: action === 'Bought' ? 'bullish' : action === 'Sold' ? 'bearish' : WHALE_IMPACTS[Math.floor(Math.random() * WHALE_IMPACTS.length)],
    }
  }, [])

  useEffect(() => {
    // Fetch real whale data on mount and every 60s
    const fetchWhales = async () => {
      try {
        const movements = await fetchRecentWhaleMovements()
        if (movements.length > 0) {
          setData(prev => {
            // Deduplicate: don't add entries that already exist
            const existing = new Set(prev.map(p => `${p.wallet}-${p.token}-${p.value}`))
            const newItems = movements.filter(m =>
              !existing.has(`${m.wallet}-${m.token}-${m.value}`)
            )
            if (newItems.length === 0) return prev
            return [...newItems, ...prev].slice(0, 20)
          })
        }
      } catch {
        // Silently fail — simulation fills the gaps
      }
    }

    fetchWhales()
    const apiTimer = setInterval(fetchWhales, 60_000) // Real data every 60s

    // Inject simulated movements between real API polls for liveliness
    const simTimer = setInterval(() => {
      setData(prev => [generateMovement(), ...prev.slice(0, 19)])
    }, interval)

    return () => {
      clearInterval(apiTimer)
      clearInterval(simTimer)
    }
  }, [interval, generateMovement])

  return data
}
