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

const STATUS_STYLES: Record<OverallStatus, { bg: string; border: string; dot: string; dotGlow: string; text: string }> = {
  live: {
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.15)',
    dot: '#34d399',
    dotGlow: '0 0 8px rgba(16, 185, 129, 0.5)',
    text: '#34d399',
  },
  partial: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.15)',
    dot: '#fbbf24',
    dotGlow: '0 0 8px rgba(245, 158, 11, 0.5)',
    text: '#fbbf24',
  },
  offline: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.15)',
    dot: '#f87171',
    dotGlow: '0 0 8px rgba(239, 68, 68, 0.5)',
    text: '#f87171',
  },
}

const FEED_LABELS: Record<string, string> = {
  prices_ws: 'Price Stream',
  prices_rest: 'Market Data',
  gas: 'Gas Prices',
  whales: 'Whale Tracker',
  threats: 'Threat Intel',
  defi: 'DeFi Data',
}

const FEED_STATUS_STYLES: Record<FeedStatusValue, { bg: string; glow: string }> = {
  connected: { bg: '#34d399', glow: '0 0 6px rgba(16, 185, 129, 0.4)' },
  live: { bg: '#34d399', glow: '0 0 6px rgba(16, 185, 129, 0.4)' },
  cached: { bg: '#fbbf24', glow: '0 0 6px rgba(245, 158, 11, 0.4)' },
  reconnecting: { bg: '#fbbf24', glow: '0 0 6px rgba(245, 158, 11, 0.4)' },
  error: { bg: '#f87171', glow: '0 0 6px rgba(239, 68, 68, 0.4)' },
  disconnected: { bg: '#71717a', glow: 'none' },
  unknown: { bg: '#52525b', glow: 'none' },
}

export default function ConnectionStatus() {
  const [feeds, setFeeds] = useState<Partial<FeedStatusMap>>({})
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    return subscribe(setFeeds)
  }, [])

  const overall = getOverallStatus()
  const config = STATUS_CONFIG[overall]
  const styles = STATUS_STYLES[overall]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300"
        style={{
          background: styles.bg,
          border: `1px solid ${styles.border}`,
        }}
      >
        <div
          className={`w-2 h-2 rounded-full ${overall === 'live' ? 'animate-pulse' : ''}`}
          style={{ background: styles.dot, boxShadow: styles.dotGlow }}
        />
        <span className="text-xs font-medium" style={{ color: styles.text }}>{config.label}</span>
        <motion.div
          animate={{ rotate: showDropdown ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown size={12} style={{ color: styles.text }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-10 w-56 rounded-xl p-3 space-y-1.5 z-50"
            style={{
              background: 'linear-gradient(135deg, rgba(17, 26, 46, 0.95), rgba(12, 18, 33, 0.98))',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(26, 39, 68, 0.6)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02)',
            }}
          >
            <h4 className="text-xs font-semibold text-text-primary px-1 mb-2">Data Feeds</h4>
            {Object.entries(FEED_LABELS).map(([key, label]) => {
              const status = (feeds as Record<string, FeedStatusValue>)[key] ?? 'unknown'
              const feedStyle = FEED_STATUS_STYLES[status] ?? FEED_STATUS_STYLES.unknown
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg transition-all duration-200"
                  style={{ background: 'transparent' }}
                >
                  <span className="text-xs text-text-secondary">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted capitalize">{status}</span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${status === 'reconnecting' ? 'animate-pulse' : ''}`}
                      style={{ background: feedStyle.bg, boxShadow: feedStyle.glow }}
                    />
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
