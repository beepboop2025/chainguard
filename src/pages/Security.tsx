import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import StatCard from '../components/common/StatCard'
import Header from '../components/layout/Header'
import { TOKEN_APPROVALS } from '../data/mockData'
import type { TokenApproval, RiskLevel } from '../types'

type FilterValue = RiskLevel | 'all'

export default function Security() {
  const [approvals, setApprovals] = useState<TokenApproval[]>(TOKEN_APPROVALS)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [revoking, setRevoking] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return approvals
    return approvals.filter(a => a.riskLevel === filter)
  }, [approvals, filter])

  const stats = useMemo(() => ({
    total: approvals.length,
    critical: approvals.filter(a => a.riskLevel === 'critical').length,
    high: approvals.filter(a => a.riskLevel === 'high').length,
    unlimited: approvals.filter(a => a.amount === 'Unlimited').length,
    unverified: approvals.filter(a => !a.contractVerified).length,
  }), [approvals])

  const handleRevoke = (index: number) => {
    setRevoking(index)
    setTimeout(() => {
      setApprovals(prev => prev.filter((_, i) => i !== index))
      setRevoking(null)
    }, 1500)
  }

  const filterOptions: FilterValue[] = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <div>
      <Header title="Security Center" subtitle="Token approvals, contract verification & risk management" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Approvals" value={stats.total} subValue={`${stats.unlimited} unlimited`} icon={Shield} color="blue" />
          <StatCard label="Critical Risks" value={stats.critical} subValue="Needs immediate action" icon={AlertTriangle} color="red" />
          <StatCard label="High Risk" value={stats.high} subValue="Review recommended" icon={AlertTriangle} color="amber" />
          <StatCard label="Unverified Contracts" value={stats.unverified} subValue="Contracts not audited" icon={XCircle} color="purple" />
        </div>

        {/* Risk Banner */}
        {stats.critical > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-red-400">
                {stats.critical} critical approval{stats.critical > 1 ? 's' : ''} detected
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">
                You have unlimited approvals to unverified contracts. These could drain your tokens at any time.
              </p>
            </div>
            <button
              onClick={() => setFilter('critical')}
              className="ml-auto px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors flex-shrink-0"
            >
              Review Now
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize
                ${filter === f
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-card border border-transparent'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Approvals List */}
        <Card>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((approval) => {
                const originalIndex = approvals.indexOf(approval)
                return (
                  <motion.div
                    key={`${approval.token}-${approval.spenderAddr}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-lg border transition-all
                      ${approval.riskLevel === 'critical' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' :
                        approval.riskLevel === 'high' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' :
                        'bg-bg-primary/50 border-border-primary hover:border-border-accent'}
                    `}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        {/* Token Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                          ${approval.riskLevel === 'critical' ? 'bg-red-500/15 text-red-400' :
                            approval.riskLevel === 'high' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-blue-500/15 text-blue-400'}`}
                        >
                          {approval.token.slice(0, 3)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text-primary">{approval.token}</span>
                            <span className="text-text-muted text-xs">→</span>
                            <span className="text-sm text-text-secondary">{approval.spender}</span>
                            {approval.contractVerified ? (
                              <CheckCircle size={14} className="text-emerald-400" />
                            ) : (
                              <XCircle size={14} className="text-red-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-muted font-mono">{approval.spenderAddr}</span>
                            <Badge variant={
                              approval.riskLevel === 'critical' ? 'danger' :
                              approval.riskLevel === 'high' ? 'danger' :
                              approval.riskLevel === 'medium' ? 'warning' : 'success'
                            }>
                              {approval.riskLevel}
                            </Badge>
                            <span className="text-xs text-text-muted capitalize">{approval.chain}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${approval.amount === 'Unlimited' ? 'text-amber-400' : 'text-text-primary'}`}>
                            {approval.amount}
                          </p>
                          <p className="text-xs text-text-muted">{approval.lastUsed}</p>
                        </div>

                        <button
                          onClick={() => handleRevoke(originalIndex)}
                          disabled={revoking === originalIndex}
                          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2
                            ${revoking === originalIndex
                              ? 'bg-amber-500/20 text-amber-400 cursor-wait'
                              : approval.riskLevel === 'critical' || approval.riskLevel === 'high'
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                            }`}
                        >
                          {revoking === originalIndex ? (
                            <>
                              <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            <>
                              <Trash2 size={12} />
                              Revoke
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
                <p className="text-text-primary font-medium">All clear!</p>
                <p className="text-xs text-text-muted mt-1">No approvals match this filter</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
