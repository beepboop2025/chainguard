import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts'
import {
  DollarSign, TrendingUp, TrendingDown, ShieldCheck,
  AlertTriangle, Layers, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import RiskGauge from '../components/common/RiskGauge'
import Badge from '../components/common/Badge'
import Header from '../components/layout/Header'
import { useLiveData } from '../hooks/useLiveData'
import { PORTFOLIO_TOKENS, PORTFOLIO_HISTORY, DEFI_POSITIONS, TOKEN_APPROVALS, RISK_METRICS } from '../data/mockData'
import { calculatePortfolioValue, calculateRiskScore, getOverallRiskLevel } from '../utils/riskCalculations'
import { formatCurrency, formatPercent } from '../utils/formatters'

const CHAIN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#f97316']

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

interface ChartTooltipPayload {
  value: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload[]; label?: string }) {
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
      <p className="text-text-secondary mb-1">{label}</p>
      <p className="text-text-primary font-semibold text-sm">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const liveTokens = useLiveData(PORTFOLIO_TOKENS, 2000)

  const portfolioValue = useMemo(() => calculatePortfolioValue(liveTokens), [liveTokens])
  const riskScore = useMemo(() => calculateRiskScore(DEFI_POSITIONS, TOKEN_APPROVALS), [])
  const riskInfo = useMemo(() => getOverallRiskLevel(riskScore), [riskScore])

  const chainAllocation = useMemo(() => {
    const chains: Record<string, number> = {}
    liveTokens.forEach(t => {
      chains[t.chain] = (chains[t.chain] || 0) + t.allocation
    })
    return Object.entries(chains).map(([name, value]) => ({ name, value: +value.toFixed(1) }))
  }, [liveTokens])

  const totalChange = useMemo(() => {
    return liveTokens.reduce((sum, t) => sum + t.change24h * (t.allocation / 100), 0)
  }, [liveTokens])

  const defiTotal = DEFI_POSITIONS.reduce((s, p) => s + p.supplied, 0)

  return (
    <div>
      <Header title="Portfolio Dashboard" subtitle="Real-time multi-chain portfolio analytics" />

      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Top Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Portfolio Value"
            value={formatCurrency(portfolioValue)}
            subValue={formatPercent(totalChange)}
            icon={DollarSign}
            trend={totalChange >= 0 ? 'up' : 'down'}
            color="blue"
          />
          <StatCard
            label="24h Change"
            value={formatCurrency(portfolioValue * totalChange / 100)}
            subValue={`${formatPercent(totalChange)} today`}
            icon={totalChange >= 0 ? TrendingUp : TrendingDown}
            trend={totalChange >= 0 ? 'up' : 'down'}
            color={totalChange >= 0 ? 'emerald' : 'red'}
          />
          <StatCard
            label="DeFi TVL"
            value={formatCurrency(defiTotal)}
            subValue={`${DEFI_POSITIONS.length} active positions`}
            icon={Layers}
            color="purple"
          />
          <StatCard
            label="Security Score"
            value={`${riskScore}/100`}
            subValue={`${riskInfo.level} Risk`}
            icon={riskScore >= 60 ? ShieldCheck : AlertTriangle}
            color={riskScore >= 60 ? 'emerald' : 'red'}
          />
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Portfolio Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Portfolio Performance</h3>
                <p className="text-xs text-text-muted mt-0.5">Last 90 days</p>
              </div>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(17, 26, 46, 0.5)', border: '1px solid rgba(26, 39, 68, 0.3)' }}>
                {['7D', '30D', '90D', '1Y'].map(period => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300
                      ${period === '90D'
                        ? 'bg-accent-blue/15 text-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                        : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03]'}`}
                  >
                    {period}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PORTFOLIO_HISTORY}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="40%" stopColor="#3b82f6" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="portfolioStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 8" stroke="rgba(26, 39, 68, 0.2)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    interval={14}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59, 130, 246, 0.15)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#portfolioStroke)"
                    strokeWidth={2.5}
                    fill="url(#portfolioGrad)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Risk + Allocation */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Risk Overview</h3>
            <RiskGauge score={riskScore} />
            <div className="mt-5 space-y-3">
              {[
                { label: 'VaR (95%, 1D)', value: formatPercent(RISK_METRICS.portfolioVaR.value), color: 'text-red-400' },
                { label: 'Sharpe Ratio', value: String(RISK_METRICS.sharpeRatio), color: 'text-text-primary' },
                { label: 'Max Drawdown', value: formatPercent(RISK_METRICS.maxDrawdown), color: 'text-red-400' },
                { label: 'Volatility (30D)', value: `${RISK_METRICS.volatility}%`, color: 'text-amber-400' },
                { label: 'BTC Correlation', value: String(RISK_METRICS.correlationWithBTC), color: 'text-text-primary' },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  className="flex justify-between text-xs py-1.5 px-2 rounded-lg transition-colors duration-300 hover:bg-white/[0.02]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                >
                  <span className="text-text-secondary">{metric.label}</span>
                  <span className={`font-mono ${metric.color}`}>{metric.value}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Token Holdings + DeFi Positions */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Holdings Table */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Token Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted" style={{ borderBottom: '1px solid rgba(26, 39, 68, 0.4)' }}>
                    <th className="text-left py-2.5 font-medium">Token</th>
                    <th className="text-right py-2.5 font-medium">Price</th>
                    <th className="text-right py-2.5 font-medium">24h</th>
                    <th className="text-right py-2.5 font-medium">Value</th>
                    <th className="text-right py-2.5 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTokens.map((token, i) => (
                    <motion.tr
                      key={token.symbol}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="group table-row-hover"
                      style={{ borderBottom: '1px solid rgba(26, 39, 68, 0.25)' }}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(6, 182, 212, 0.12))',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.08)',
                            }}
                          >
                            {token.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">{token.symbol}</span>
                            <span className="text-text-muted ml-1.5 hidden sm:inline">{token.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-text-primary font-mono tabular-nums">
                        <motion.span
                          key={token.price}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          ${token.price.toLocaleString()}
                        </motion.span>
                      </td>
                      <td className={`text-right font-mono tabular-nums ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className="inline-flex items-center gap-0.5">
                          {token.change24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {Math.abs(token.change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right text-text-primary font-mono tabular-nums">{formatCurrency(token.balance * token.price)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26, 39, 68, 0.4)' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${token.allocation}%` }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                            />
                          </div>
                          <span className="text-text-secondary w-8 text-right tabular-nums">{token.allocation}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* DeFi Positions */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">DeFi Positions</h3>
            <div className="space-y-3">
              {DEFI_POSITIONS.map((pos, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ scale: 1.01, x: 4, transition: { duration: 0.2 } }}
                  className="p-3.5 rounded-xl transition-all duration-300 cursor-default"
                  style={{
                    background: 'rgba(6, 10, 19, 0.35)',
                    border: '1px solid rgba(26, 39, 68, 0.35)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-text-primary">{pos.protocol}</span>
                      <Badge variant={pos.risk === 'low' ? 'success' : pos.risk === 'medium' ? 'warning' : 'danger'}>
                        {pos.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-muted capitalize">{pos.chain}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-text-muted">Supplied</span>
                      <p className="text-text-primary font-mono mt-0.5 tabular-nums">{formatCurrency(pos.supplied)}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">{pos.healthFactor ? 'Health' : 'APY'}</span>
                      <p className={`font-mono mt-0.5 tabular-nums ${pos.healthFactor
                        ? pos.healthFactor >= 1.5 ? 'text-emerald-400' : 'text-red-400'
                        : 'text-emerald-400'
                      }`}>
                        {pos.healthFactor ? pos.healthFactor.toFixed(2) : `${pos.apy}%`}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">{pos.ilLoss !== undefined ? 'IL Loss' : pos.leverage ? 'Leverage' : 'Borrowed'}</span>
                      <p className="text-text-primary font-mono mt-0.5 tabular-nums">
                        {pos.ilLoss !== undefined ? `${pos.ilLoss}%` : pos.leverage || formatCurrency(pos.borrowed)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Chain Distribution */}
        <motion.div variants={staggerItem}>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Chain Distribution</h3>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {CHAIN_COLORS.map((color, i) => (
                        <linearGradient key={i} id={`pie-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={chainAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      stroke="rgba(6, 10, 19, 0.4)"
                      strokeWidth={2}
                      animationBegin={300}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {chainAllocation.map((_, i) => (
                        <Cell key={i} fill={`url(#pie-grad-${i % CHAIN_COLORS.length})`} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {chainAllocation.map((chain, i) => (
                  <motion.div
                    key={chain.name}
                    className="flex items-center gap-2.5 cursor-default"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.08 }}
                    whileHover={{ x: 3, transition: { duration: 0.15 } }}
                  >
                    <div
                      className="w-3 h-3 rounded-md"
                      style={{
                        background: CHAIN_COLORS[i % CHAIN_COLORS.length],
                        boxShadow: `0 0 10px ${CHAIN_COLORS[i % CHAIN_COLORS.length]}40`,
                      }}
                    />
                    <span className="text-xs text-text-secondary capitalize">{chain.name}</span>
                    <span className="text-xs text-text-primary font-semibold tabular-nums">{chain.value}%</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
