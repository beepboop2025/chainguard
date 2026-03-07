import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { Fuel, Zap, Clock, TrendingDown, ArrowDown, ArrowUp, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Header from '../components/layout/Header'
import { useLiveGas } from '../hooks/useLiveData'
import { GAS_DATA, GAS_HISTORY, CHAINS } from '../data/mockData'

const GAS_COLORS = {
  low: '#10b981',
  standard: '#3b82f6',
  fast: '#f59e0b',
  instant: '#ef4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-text-primary">
          <span style={{ color: p.color }}>{p.name}</span>: {p.value} Gwei
        </p>
      ))}
    </div>
  )
}

export default function GasOptimizer() {
  const liveGas = useLiveGas(GAS_DATA, 4000)

  const cheapestChain = useMemo(() => {
    let min = Infinity
    let chain = ''
    for (const [name, gas] of Object.entries(liveGas)) {
      if (gas.standard < min) {
        min = gas.standard
        chain = name
      }
    }
    return { chain, cost: min }
  }, [liveGas])

  const ethGas = liveGas.ethereum

  // Optimal timing recommendation
  const currentHour = new Date().getHours()
  const optimalWindow = currentHour >= 2 && currentHour <= 6
    ? 'Now (off-peak hours)'
    : 'Wait for 2:00-6:00 AM UTC'

  return (
    <div>
      <Header title="Gas Optimizer" subtitle="Cross-chain gas estimation & timing optimization" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="ETH Gas (Standard)"
            value={`${ethGas.standard < 1 ? ethGas.standard.toFixed(3) : ethGas.standard.toFixed(0)} Gwei`}
            subValue={`Avg tx: ${ethGas.avgTxCost}`}
            icon={Fuel}
            color="blue"
          />
          <StatCard
            label="Cheapest Chain"
            value={cheapestChain.chain}
            subValue={`${cheapestChain.cost.toFixed(2)} Gwei`}
            icon={TrendingDown}
            color="emerald"
          />
          <StatCard
            label="Gas Trend"
            value={ethGas.standard < 20 ? 'Low' : ethGas.standard < 40 ? 'Normal' : 'High'}
            subValue={ethGas.standard < 20 ? 'Good time to transact' : 'Consider waiting'}
            icon={ethGas.standard < 20 ? ArrowDown : ArrowUp}
            color={ethGas.standard < 20 ? 'emerald' : 'amber'}
          />
          <StatCard
            label="Optimal Window"
            value={optimalWindow.includes('Now') ? 'Now' : '2-6 AM'}
            subValue={optimalWindow}
            icon={Clock}
            color="cyan"
          />
        </div>

        {/* Gas Recommendation Banner */}
        {ethGas.standard < 20 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
          >
            <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-emerald-400">Optimal gas window detected</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                ETH gas is currently below 20 Gwei. This is a good time for large transactions or contract deployments.
              </p>
            </div>
          </motion.div>
        )}

        {/* Cross-Chain Comparison */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Cross-Chain Gas Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Object.entries(liveGas).map(([chain, gas], i) => {
              const chainInfo = CHAINS[chain]
              return (
                <motion.div
                  key={chain}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-bg-primary/50 border border-border-primary hover:border-border-accent transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{chainInfo?.icon || '●'}</span>
                      <span className="text-sm font-medium text-text-primary capitalize">{chain}</span>
                    </div>
                    <span className="text-xs text-text-muted">{gas.avgTxCost}</span>
                  </div>

                  <div className="space-y-2">
                    {['low', 'standard', 'fast', 'instant'].map(tier => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: GAS_COLORS[tier] }} />
                          <span className="text-xs text-text-secondary capitalize">{tier}</span>
                        </div>
                        <span className="text-xs text-text-primary font-mono">
                          {gas[tier].toFixed(gas[tier] < 1 ? 4 : 0)} {gas.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Gas History Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">24h Gas History (Ethereum)</h3>
              <p className="text-xs text-text-muted">Gwei over time - lower is better</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GAS_HISTORY}>
                <defs>
                  <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ethereum" stroke="#3b82f6" strokeWidth={2} fill="url(#gasGrad)" name="ETH" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Transaction Cost Estimator */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Transaction Cost Estimator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'Token Transfer', gas: 21000, icon: '↗' },
              { type: 'Swap (DEX)', gas: 150000, icon: '⇄' },
              { type: 'NFT Mint', gas: 250000, icon: '◆' },
            ].map((tx, i) => (
              <motion.div
                key={tx.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-bg-primary/50 border border-border-primary"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{tx.icon}</span>
                  <span className="text-sm font-medium text-text-primary">{tx.type}</span>
                </div>
                <div className="space-y-2">
                  {['low', 'standard', 'fast'].map(tier => {
                    const cost = (tx.gas * ethGas[tier] * 1e-9 * 3842).toFixed(2)
                    return (
                      <div key={tier} className="flex justify-between items-center">
                        <span className="text-xs capitalize" style={{ color: GAS_COLORS[tier] }}>{tier}</span>
                        <span className="text-xs text-text-primary font-mono">${cost}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
