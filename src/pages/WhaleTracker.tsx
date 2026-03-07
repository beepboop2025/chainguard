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

export default function WhaleTracker() {
  const movements = useLiveWhale(WHALE_MOVEMENTS, 6000)

  const stats = useMemo(() => {
    const buys = movements.filter(m => m.action === 'Bought').length
    const sells = movements.filter(m => m.action === 'Sold').length
    const totalVolume = movements.reduce((s, m) => {
      const val = parseFloat(m.value.replace(/[$M]/g, ''))
      return s + (isNaN(val) ? 0 : val)
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

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Movements" value={stats.total} subValue="Tracked wallets" icon={Activity} color="blue" />
          <StatCard label="Buy Signals" value={stats.buys} subValue="Bullish whale activity" icon={TrendingUp} color="emerald" />
          <StatCard label="Sell Signals" value={stats.sells} subValue="Bearish whale activity" icon={TrendingDown} color="red" />
          <StatCard label="Volume (24h)" value={`$${stats.volume.toFixed(0)}M`} subValue="Total whale volume" icon={Activity} color="purple" />
        </div>

        {/* Sentiment Indicator */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Whale Sentiment</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-text-secondary">Buys {stats.buys}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-text-secondary">Sells {stats.sells}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full bg-bg-primary overflow-hidden flex">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.buys / Math.max(stats.buys + stats.sells, 1)) * 100}%` }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.sells / Math.max(stats.buys + stats.sells, 1)) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-emerald-400 font-medium">
              {((stats.buys / Math.max(stats.buys + stats.sells, 1)) * 100).toFixed(0)}% Bullish
            </span>
            <span className="text-xs text-red-400 font-medium">
              {((stats.sells / Math.max(stats.buys + stats.sells, 1)) * 100).toFixed(0)}% Bearish
            </span>
          </div>
        </Card>

        {/* Movement Feed */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Live Feed</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Streaming</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {movements.map((move, i) => (
                <motion.div
                  key={`${move.wallet}-${move.token}-${i}`}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className={`p-4 rounded-lg border transition-all hover:bg-bg-card-hover
                    ${move.impact === 'bullish' ? 'border-emerald-500/10 bg-emerald-500/[0.03]' :
                      move.impact === 'bearish' ? 'border-red-500/10 bg-red-500/[0.03]' :
                      'border-border-primary bg-bg-primary/30'}
                  `}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getImpactBg(move.impact)}`}>
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
                      <p className="text-sm font-semibold text-text-primary">{move.value}</p>
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
      </div>
    </div>
  )
}
