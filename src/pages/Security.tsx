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

export default function Security() {
  const [approvals, setApprovals] = useState<TokenApproval[]>(TOKEN_APPROVALS)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [revoking, setRevoking] = useState<string | null>(null)

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

  const handleRevoke = (approval: TokenApproval) => {
    const key = approval.spenderAddr + approval.token
    setRevoking(key)
    setTimeout(() => {
      setApprovals(prev => prev.filter(a => a.spenderAddr + a.token !== key))
      setRevoking(null)
    }, 1500)
  }

  const filterOptions: FilterValue[] = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <div>
      <Header title="Security Center" subtitle="Token approvals, contract verification & risk management" />

      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Approvals" value={stats.total} subValue={`${stats.unlimited} unlimited`} icon={Shield} color="blue" />
          <StatCard label="Critical Risks" value={stats.critical} subValue="Needs immediate action" icon={AlertTriangle} color="red" />
          <StatCard label="High Risk" value={stats.high} subValue="Review recommended" icon={AlertTriangle} color="amber" />
          <StatCard label="Unverified Contracts" value={stats.unverified} subValue="Contracts not audited" icon={XCircle} color="purple" />
        </motion.div>

        {/* Risk Banner */}
        {stats.critical > 0 && (
          <motion.div
            variants={staggerItem}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              boxShadow: '0 4px 24px rgba(239, 68, 68, 0.06)',
            }}
          >
            <div className="p-2 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-400">
                {stats.critical} critical approval{stats.critical > 1 ? 's' : ''} detected
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">
                You have unlimited approvals to unverified contracts. These could drain your tokens at any time.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter('critical')}
              className="ml-auto px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex-shrink-0 btn-glow"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}
            >
              Review Now
            </motion.button>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={staggerItem} className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(17, 26, 46, 0.4)', border: '1px solid rgba(26, 39, 68, 0.3)' }}>
            {filterOptions.map(f => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 capitalize
                  ${filter === f
                    ? 'bg-accent-blue/15 text-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.08)]'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03]'
                  }`}
                style={filter === f ? { border: '1px solid rgba(59, 130, 246, 0.15)' } : { border: '1px solid transparent' }}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Approvals List */}
        <motion.div variants={staggerItem}>
          <Card>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((approval) => {
                  const approvalKey = approval.spenderAddr + approval.token
                  return (
                    <motion.div
                      key={`${approval.token}-${approval.spenderAddr}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="p-4 rounded-xl transition-all duration-300"
                      style={{
                        background: approval.riskLevel === 'critical'
                          ? 'rgba(239, 68, 68, 0.04)'
                          : approval.riskLevel === 'high'
                          ? 'rgba(245, 158, 11, 0.04)'
                          : 'rgba(6, 10, 19, 0.25)',
                        border: approval.riskLevel === 'critical'
                          ? '1px solid rgba(239, 68, 68, 0.12)'
                          : approval.riskLevel === 'high'
                          ? '1px solid rgba(245, 158, 11, 0.12)'
                          : '1px solid rgba(26, 39, 68, 0.35)',
                      }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          {/* Token Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                            ${approval.riskLevel === 'critical' ? 'bg-red-500/12 text-red-400' :
                              approval.riskLevel === 'high' ? 'bg-amber-500/12 text-amber-400' :
                              'bg-blue-500/12 text-blue-400'}`}
                          >
                            {approval.token.slice(0, 3)}
                          </motion.div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-text-primary">{approval.token}</span>
                              <span className="text-text-muted text-xs">{'\u2192'}</span>
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

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRevoke(approval)}
                            disabled={revoking === approvalKey}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-2 btn-glow
                              ${revoking === approvalKey
                                ? 'cursor-wait'
                                : ''
                              }`}
                            style={{
                              background: revoking === approvalKey
                                ? 'rgba(245, 158, 11, 0.12)'
                                : approval.riskLevel === 'critical' || approval.riskLevel === 'high'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(17, 26, 46, 0.5)',
                              color: revoking === approvalKey
                                ? '#fbbf24'
                                : approval.riskLevel === 'critical' || approval.riskLevel === 'high'
                                ? '#f87171'
                                : '#94a3b8',
                              border: revoking === approvalKey
                                ? '1px solid rgba(245, 158, 11, 0.2)'
                                : approval.riskLevel === 'critical' || approval.riskLevel === 'high'
                                ? '1px solid rgba(239, 68, 68, 0.15)'
                                : '1px solid rgba(26, 39, 68, 0.4)',
                            }}
                          >
                            {revoking === approvalKey ? (
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
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    className="inline-flex p-4 rounded-2xl mb-4"
                    style={{ background: 'rgba(16, 185, 129, 0.08)' }}
                    animate={{
                      boxShadow: ['0 0 15px rgba(16, 185, 129, 0.05)', '0 0 25px rgba(16, 185, 129, 0.12)', '0 0 15px rgba(16, 185, 129, 0.05)'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <CheckCircle size={40} className="text-emerald-400" />
                  </motion.div>
                  <p className="text-text-primary font-medium">All clear!</p>
                  <p className="text-xs text-text-muted mt-1">No approvals match this filter</p>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
