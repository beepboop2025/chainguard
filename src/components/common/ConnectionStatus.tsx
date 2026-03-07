import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, ChevronDown } from 'lucide-react'
import { subscribe, getOverallStatus } from '../../services/connectionManager'
import type { OverallStatus, FeedStatusMap, FeedStatusValue, StatusConfig } from '../../types'

const STATUS_CONFIG: Record<OverallStatus, StatusConfig> = {
  live: { color: 'emerald', label: 'Live', icon: Wifi },
  partial: { color: 'amber', label: 'Partial', icon: Wifi },
  offline: { color: 'red', label: 'Offline', icon: WifiOff },
}

const FEED_LABELS: Record<string, string> = {
  prices_ws: 'Price Stream',
  prices_rest: 'Market Data',
  gas: 'Gas Prices',
  whales: 'Whale Tracker',
  threats: 'Threat Intel',
  defi: 'DeFi Data',
}

const FEED_STATUS_COLORS: Record<FeedStatusValue, string> = {
  connected: 'bg-emerald-400',
  live: 'bg-emerald-400',
  cached: 'bg-amber-400',
  reconnecting: 'bg-amber-400 animate-pulse',
  error: 'bg-red-400',
  disconnected: 'bg-zinc-500',
  unknown: 'bg-zinc-600',
}

export default function ConnectionStatus() {
  const [feeds, setFeeds] = useState<Partial<FeedStatusMap>>({})
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    return subscribe(setFeeds)
  }, [])

  const overall = getOverallStatus()
  const config = STATUS_CONFIG[overall]

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/20 hover:bg-${config.color}-500/15 transition-colors`}
      >
        <div className={`w-2 h-2 rounded-full bg-${config.color}-400 ${overall === 'live' ? 'animate-pulse' : ''}`} />
        <span className={`text-xs text-${config.color}-400 font-medium`}>{config.label}</span>
        <ChevronDown size={12} className={`text-${config.color}-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-56 glass-card rounded-xl p-3 space-y-1.5 shadow-2xl z-50"
          >
            <h4 className="text-xs font-semibold text-text-primary px-1 mb-2">Data Feeds</h4>
            {Object.entries(FEED_LABELS).map(([key, label]) => {
              const status = (feeds as Record<string, FeedStatusValue>)[key] ?? 'unknown'
              return (
                <div key={key} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-bg-primary/50">
                  <span className="text-xs text-text-secondary">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted capitalize">{status}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${FEED_STATUS_COLORS[status] ?? FEED_STATUS_COLORS.unknown}`} />
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
