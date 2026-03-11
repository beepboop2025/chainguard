import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Fuel, Clock, TrendingDown, ArrowDown, ArrowUp, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Header from '../components/layout/Header'
import { useLiveGas } from '../hooks/useLiveData'
import { GAS_DATA, GAS_HISTORY, CHAINS } from '../data/mockData'
import type { GasTier } from '../types'

const GAS_COLORS: Record<GasTier, string> = {
  low: '#10b981',
  standard: '#3b82f6',
  fast: '#f59e0b',
  instant: '#ef4444',
}

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

interface GasTooltipPayload {
  value: number
  color: string
  name: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: GasTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl p-3.5 text-xs"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 26, 46, 0.96), rgba(12, 18, 33, 0.99))',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(59, 130, 246, 0.05)',
      }}
    >
      <p className="text-text-secondary mb-1.5">{label}</p>
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
  const [ethPrice] = useState(3842)

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

  const currentHour = new Date().getHours()
  const optimalWindow = currentHour >= 2 && currentHour <= 6
    ? 'Now (off-peak hours)'
    : 'Wait for 2:00-6:00 AM UTC'

  const gasTiers: GasTier[] = ['low', 'standard', 'fast', 'instant']

  return (
    <div>
      <Header title="Gas Optimizer" subtitle="Cross-chain gas estimation & timing optimization" />

      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </motion.div>

        {/* Gas Recommendation Banner */}
        {ethGas.standard < 20 && (
          <motion.div
            variants={staggerItem}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03))',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              boxShadow: '0 4px 24px rgba(16, 185, 129, 0.06)',
            }}
          >
            <div className="p-2 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">Optimal gas window detected</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                ETH gas is currently below 20 Gwei. This is a good time for large transactions or contract deployments.
              </p>
            </div>
          </motion.div>
        )}

        {/* Cross-Chain Comparison */}
        <motion.div variants={staggerItem}>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Cross-Chain Gas Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Object.entries(liveGas).map(([chain, gas], i) => {
                const chainInfo = CHAINS[chain]
                return (
                  <motion.div
                    key={chain}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
                    className="p-4 rounded-xl transition-all duration-400 cursor-default"
                    style={{
                      background: 'rgba(6, 10, 19, 0.35)',
                      border: '1px solid rgba(26, 39, 68, 0.35)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{chainInfo?.icon || ''}</span>
                        <span className="text-sm font-medium text-text-primary capitalize">{chain}</span>
                      </div>
                      <span className="text-xs text-text-muted font-mono tabular-nums">{gas.avgTxCost}</span>
                    </div>

                    <div className="space-y-2">
                      {gasTiers.map(tier => (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: GAS_COLORS[tier],
                                boxShadow: `0 0 8px ${GAS_COLORS[tier]}50`,
                              }}
                            />
                            <span className="text-xs text-text-secondary capitalize">{tier}</span>
                          </div>
                          <span className="text-xs text-text-primary font-mono tabular-nums">
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
        </motion.div>

        {/* Gas History Chart */}
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">24h Gas History (Ethereum)</h3>
                <p className="text-xs text-text-muted mt-0.5">Gwei over time -- lower is better</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GAS_HISTORY}>
                  <defs>
                    <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="40%" stopColor="#3b82f6" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gasStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 8" stroke="rgba(26, 39, 68, 0.2)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59, 130, 246, 0.15)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="ethereum"
                    stroke="url(#gasStroke)"
                    strokeWidth={2.5}
                    fill="url(#gasGrad)"
                    name="ETH"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Transaction Cost Estimator */}
        <motion.div variants={staggerItem}>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Transaction Cost Estimator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                { type: 'Token Transfer', gas: 21000, icon: '' },
                { type: 'Swap (DEX)', gas: 150000, icon: '' },
                { type: 'NFT Mint', gas: 250000, icon: '' },
              ] as const).map((tx, i) => (
                <motion.div
                  key={tx.type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
                  className="p-4 rounded-xl transition-all duration-400"
                  style={{
                    background: 'rgba(6, 10, 19, 0.35)',
                    border: '1px solid rgba(26, 39, 68, 0.35)',
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-lg">{tx.icon}</span>
                    <span className="text-sm font-medium text-text-primary">{tx.type}</span>
                  </div>
                  <div className="space-y-2">
                    {(['low', 'standard', 'fast'] as const).map(tier => {
                      const cost = (tx.gas * ethGas[tier] * 1e-9 * ethPrice).toFixed(2)
                      return (
                        <div key={tier} className="flex justify-between items-center">
                          <span className="text-xs capitalize font-medium" style={{ color: GAS_COLORS[tier] }}>{tier}</span>
                          <span className="text-xs text-text-primary font-mono tabular-nums">${cost}</span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
