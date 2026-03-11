import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Header from '../components/layout/Header'
import { useLiveWhale } from '../hooks/useLiveData'
import { WHALE_MOVEMENTS } from '../data/mockData'
import { getImpactBg } from '../utils/formatters'
import type { ReactNode } from 'react'

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function WhaleTracker() {
  const movements = useLiveWhale(WHALE_MOVEMENTS, 6000)

  const stats = useMemo(() => {
    const buys = movements.filter(m => m.action === 'Bought').length
    const sells = movements.filter(m => m.action === 'Sold').length
    const totalVolume = movements.reduce((s, m) => {
      const match = m.value.match(/\$?([\d.]+)\s*([KMBkmb])?/)
      if (!match) return s
      let val = parseFloat(match[1])
      if (isNaN(val)) return s
      const suffix = (match[2] || '').toUpperCase()
      if (suffix === 'K') val /= 1000
      else if (suffix === 'B') val *= 1000
      return s + val
    }, 0)
    return { buys, sells, total: movements.length, volume: totalVolume }
  }, [movements])

  const getActionIcon = (action: string): ReactNode => {
    if (action === 'Bought') return <TrendingUp size={14} className="text-emerald-400" />
    if (action === 'Sold') return <TrendingDown size={14} className="text-red-400" />
    return <Minus size={14} className="text-slate-400" />
  }

  const getActionColor = (action: string): string => {
    if (action === 'Bought' || action === 'Deposited') return 'text-emerald-400'
    if (action === 'Sold' || action === 'Withdrawn') return 'text-red-400'
    return 'text-slate-400'
  }

  return (
    <div>
      <Header title="Whale Tracker" subtitle="Real-time large wallet movements across all chains" />

      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Movements" value={stats.total} subValue="Tracked wallets" icon={Activity} color="blue" />
          <StatCard label="Buy Signals" value={stats.buys} subValue="Bullish whale activity" icon={TrendingUp} color="emerald" />
          <StatCard label="Sell Signals" value={stats.sells} subValue="Bearish whale activity" icon={TrendingDown} color="red" />
          <StatCard label="Volume (24h)" value={`$${stats.volume.toFixed(0)}M`} subValue="Total whale volume" icon={Activity} color="purple" />
        </motion.div>

        {/* Sentiment Indicator */}
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Whale Sentiment</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }} />
                  <span className="text-xs text-text-secondary">Buys {stats.buys}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' }} />
                  <span className="text-xs text-text-secondary">Sells {stats.sells}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full overflow-hidden flex" style={{ background: 'rgba(26, 39, 68, 0.35)' }}>
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(stats.buys / Math.max(stats.buys + stats.sells, 1)) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #f87171, #ef4444)', boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(stats.sells / Math.max(stats.buys + stats.sells, 1)) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
            <div className="flex justify-between mt-2.5">
              <span className="text-xs text-emerald-400 font-medium tabular-nums">
                {((stats.buys / Math.max(stats.buys + stats.sells, 1)) * 100).toFixed(0)}% Bullish
              </span>
              <span className="text-xs text-red-400 font-medium tabular-nums">
                {((stats.sells / Math.max(stats.buys + stats.sells, 1)) * 100).toFixed(0)}% Bearish
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Movement Feed */}
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Live Feed</h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#10b981' }}
                  animate={{
                    boxShadow: ['0 0 4px rgba(16, 185, 129, 0.4)', '0 0 10px rgba(16, 185, 129, 0.8)', '0 0 4px rgba(16, 185, 129, 0.4)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="text-xs text-emerald-400 font-medium">Streaming</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {movements.map((move, i) => (
                  <motion.div
                    key={`${move.wallet}-${move.token}-${i}`}
                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    layout
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className="p-4 rounded-xl transition-all duration-300 cursor-default"
                    style={{
                      background: move.impact === 'bullish'
                        ? 'rgba(16, 185, 129, 0.03)'
                        : move.impact === 'bearish'
                        ? 'rgba(239, 68, 68, 0.03)'
                        : 'rgba(6, 10, 19, 0.25)',
                      border: move.impact === 'bullish'
                        ? '1px solid rgba(16, 185, 129, 0.08)'
                        : move.impact === 'bearish'
                        ? '1px solid rgba(239, 68, 68, 0.08)'
                        : '1px solid rgba(26, 39, 68, 0.25)',
                    }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getImpactBg(move.impact)}`}>
                          {getActionIcon(move.action)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-text-secondary">{move.wallet}</span>
                            <span className={`text-xs font-medium ${getActionColor(move.action)}`}>{move.action}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold text-text-primary">{move.amount}</span>
                            <Badge variant={
                              move.impact === 'bullish' ? 'success' :
                              move.impact === 'bearish' ? 'danger' : 'default'
                            }>
                              {move.impact}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-text-primary tabular-nums">{move.value}</p>
                        <div className="flex items-center gap-2 justify-end mt-0.5">
                          <span className="text-xs text-text-muted capitalize">{move.chain}</span>
                          <span className="text-xs text-text-muted">{move.time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
