import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
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
import { formatCurrency, formatPercent, getRiskBg } from '../utils/formatters'

const CHAIN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="text-text-secondary mb-1">{label}</p>
      <p className="text-text-primary font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const liveTokens = useLiveData(PORTFOLIO_TOKENS, 2000)

  const portfolioValue = useMemo(() => calculatePortfolioValue(liveTokens), [liveTokens])
  const riskScore = useMemo(() => calculateRiskScore(DEFI_POSITIONS, TOKEN_APPROVALS), [])
  const riskInfo = useMemo(() => getOverallRiskLevel(riskScore), [riskScore])

  const chainAllocation = useMemo(() => {
    const chains = {}
    liveTokens.forEach(t => {
      chains[t.chain] = (chains[t.chain] || 0) + t.allocation
    })
    return Object.entries(chains).map(([name, value]) => ({ name, value: +value.toFixed(1) }))
  }, [liveTokens])

  const totalChange = useMemo(() => {
    const weightedChange = liveTokens.reduce((sum, t) => sum + t.change24h * (t.allocation / 100), 0)
    return weightedChange
  }, [liveTokens])

  const defiTotal = DEFI_POSITIONS.reduce((s, p) => s + p.supplied, 0)

  return (
    <div>
      <Header title="Portfolio Dashboard" subtitle="Real-time multi-chain portfolio analytics" />

      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Portfolio Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Portfolio Performance</h3>
                <p className="text-xs text-text-muted">Last 90 days</p>
              </div>
              <div className="flex gap-1">
                {['7D', '30D', '90D', '1Y'].map(period => (
                  <button
                    key={period}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
                      ${period === '90D' ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-secondary'}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PORTFOLIO_HISTORY}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={14} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#portfolioGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Risk + Allocation */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Risk Overview</h3>
            <RiskGauge score={riskScore} />
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">VaR (95%, 1D)</span>
                <span className="text-red-400">{formatPercent(RISK_METRICS.portfolioVaR.value)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Sharpe Ratio</span>
                <span className="text-text-primary">{RISK_METRICS.sharpeRatio}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Max Drawdown</span>
                <span className="text-red-400">{formatPercent(RISK_METRICS.maxDrawdown)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Volatility (30D)</span>
                <span className="text-amber-400">{RISK_METRICS.volatility}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">BTC Correlation</span>
                <span className="text-text-primary">{RISK_METRICS.correlationWithBTC}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Token Holdings + DeFi Positions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Holdings Table */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Token Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted border-b border-border-primary">
                    <th className="text-left py-2 font-medium">Token</th>
                    <th className="text-right py-2 font-medium">Price</th>
                    <th className="text-right py-2 font-medium">24h</th>
                    <th className="text-right py-2 font-medium">Value</th>
                    <th className="text-right py-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTokens.map((token, i) => (
                    <motion.tr
                      key={token.symbol}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border-primary/50 hover:bg-bg-card-hover transition-colors"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-accent-cyan">
                            {token.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">{token.symbol}</span>
                            <span className="text-text-muted ml-1 hidden sm:inline">{token.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-text-primary font-mono">${token.price.toLocaleString()}</td>
                      <td className={`text-right font-mono ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className="inline-flex items-center gap-0.5">
                          {token.change24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {Math.abs(token.change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right text-text-primary font-mono">{formatCurrency(token.balance * token.price)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-bg-primary overflow-hidden">
                            <div className="h-full rounded-full bg-accent-blue" style={{ width: `${token.allocation}%` }} />
                          </div>
                          <span className="text-text-secondary w-8 text-right">{token.allocation}%</span>
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
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-3 rounded-lg bg-bg-primary/50 border border-border-primary hover:border-border-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-text-primary">{pos.protocol}</span>
                      <Badge variant={pos.risk === 'low' ? 'success' : pos.risk === 'medium' ? 'warning' : 'danger'}>
                        {pos.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-muted">{pos.chain}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-text-muted">Supplied</span>
                      <p className="text-text-primary font-mono">{formatCurrency(pos.supplied)}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">{pos.healthFactor ? 'Health' : 'APY'}</span>
                      <p className={pos.healthFactor
                        ? pos.healthFactor >= 1.5 ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'
                        : 'text-emerald-400 font-mono'
                      }>
                        {pos.healthFactor ? pos.healthFactor.toFixed(2) : `${pos.apy}%`}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">{pos.ilLoss !== undefined ? 'IL Loss' : pos.leverage ? 'Leverage' : 'Borrowed'}</span>
                      <p className="text-text-primary font-mono">
                        {pos.ilLoss !== undefined ? `${pos.ilLoss}%` : pos.leverage || formatCurrency(pos.borrowed)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chain Distribution */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Chain Distribution</h3>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chainAllocation} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                    {chainAllocation.map((_, i) => (
                      <Cell key={i} fill={CHAIN_COLORS[i % CHAIN_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {chainAllocation.map((chain, i) => (
                <div key={chain.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: CHAIN_COLORS[i % CHAIN_COLORS.length] }} />
                  <span className="text-xs text-text-secondary capitalize">{chain.name}</span>
                  <span className="text-xs text-text-primary font-medium">{chain.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
