import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Shield, Search, Ban,
  CheckCircle, XCircle, ChevronDown
} from 'lucide-react'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Header from '../components/layout/Header'
import { THREAT_TOKENS } from '../data/mockData'
import { scanToken, detectChainId } from '../services/threatService'
import type { ScoreBarProps, ScanResult } from '../types'

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

function ScoreBar({ score }: ScoreBarProps) {
  const getColor = (s: number): string => {
    if (s >= 80) return '#ef4444'
    if (s >= 60) return '#f97316'
    if (s >= 40) return '#f59e0b'
    return '#10b981'
  }

  const getGlow = (s: number): string => {
    if (s >= 80) return '0 0 10px rgba(239, 68, 68, 0.3)'
    if (s >= 60) return '0 0 10px rgba(249, 115, 22, 0.3)'
    if (s >= 40) return '0 0 10px rgba(245, 158, 11, 0.3)'
    return '0 0 10px rgba(16, 185, 129, 0.3)'
  }

  const color = getColor(score)

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(26, 39, 68, 0.4)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: getGlow(score) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

export default function ThreatScanner() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    if (!searchQuery.trim()) return
    setScanning(true)
    try {
      const chainId = detectChainId(searchQuery.trim())
      const result = await scanToken(chainId, searchQuery.trim())
      setScanResult({
        address: result.address,
        safe: result.safe,
        score: result.score,
        flags: result.flags,
        holders: result.holders,
      })
    } catch {
      setScanResult({
        address: searchQuery,
        safe: false,
        score: 0,
        flags: ['Scan failed -- please try again'],
        holders: 0,
      })
    } finally {
      setScanning(false)
    }
  }

  const criticalCount = THREAT_TOKENS.filter(t => t.riskScore >= 80).length
  const highCount = THREAT_TOKENS.filter(t => t.riskScore >= 60 && t.riskScore < 80).length

  return (
    <div>
      <Header title="Threat Scanner" subtitle="Rug pull detection, honeypot analysis & smart contract risk scoring" />

      <motion.div
        className="p-6 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Threats Detected" value={THREAT_TOKENS.length} subValue="Flagged tokens" icon={AlertTriangle} color="red" />
          <StatCard label="Critical Risk" value={criticalCount} subValue="Likely scam/rug" icon={Ban} color="red" />
          <StatCard label="High Risk" value={highCount} subValue="Exercise caution" icon={AlertTriangle} color="amber" />
          <StatCard label="Scans Today" value="1,247" subValue="Community protection" icon={Shield} color="blue" />
        </motion.div>

        {/* Contract Scanner */}
        <motion.div variants={staggerItem}>
          <Card gradient>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Smart Contract Scanner</h3>
            <p className="text-xs text-text-muted mb-4">
              Enter a token contract address to analyze for potential threats, rug pull indicators, and honeypot patterns.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Enter contract address (0x...) or token name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all duration-400"
                  style={{
                    background: 'rgba(6, 10, 19, 0.6)',
                    border: '1px solid rgba(26, 39, 68, 0.4)',
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleScan}
                disabled={scanning || !searchQuery.trim()}
                className="px-6 py-3 rounded-xl text-white text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 btn-glow"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  boxShadow: '0 4px 18px rgba(59, 130, 246, 0.25)',
                }}
              >
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Scan
                  </>
                )}
              </motion.button>
            </div>

            {/* Scan Result */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="mt-4"
                >
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: scanResult.safe
                        ? 'rgba(16, 185, 129, 0.04)'
                        : 'rgba(239, 68, 68, 0.04)',
                      border: scanResult.safe
                        ? '1px solid rgba(16, 185, 129, 0.15)'
                        : '1px solid rgba(239, 68, 68, 0.15)',
                      boxShadow: scanResult.safe
                        ? '0 4px 24px rgba(16, 185, 129, 0.05)'
                        : '0 4px 24px rgba(239, 68, 68, 0.05)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {scanResult.safe ? (
                          <div className="p-2 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle size={24} className="text-emerald-400" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <XCircle size={24} className="text-red-400" />
                          </div>
                        )}
                        <div>
                          <p className={`text-sm font-semibold ${scanResult.safe ? 'text-emerald-400' : 'text-red-400'}`}>
                            {scanResult.safe ? 'Low Risk Detected' : 'High Risk Detected'}
                          </p>
                          <p className="text-xs text-text-muted font-mono">{scanResult.address}</p>
                        </div>
                      </div>
                      <ScoreBar score={scanResult.score} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.flags.map((flag, i) => (
                        <Badge key={i} variant={scanResult.safe ? 'success' : 'danger'}>
                          {flag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted mt-2 tabular-nums">{scanResult.holders.toLocaleString()} holders detected</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Flagged Tokens */}
        <motion.div variants={staggerItem}>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Recently Flagged Tokens</h3>
            <div className="space-y-2">
              {THREAT_TOKENS.map((token, i) => (
                <motion.div
                  key={token.symbol}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <motion.div
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className="p-4 rounded-xl cursor-pointer transition-all duration-300"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{
                      background: token.riskScore >= 80
                        ? 'rgba(239, 68, 68, 0.03)'
                        : token.riskScore >= 60
                        ? 'rgba(249, 115, 22, 0.03)'
                        : 'rgba(6, 10, 19, 0.25)',
                      border: token.riskScore >= 80
                        ? '1px solid rgba(239, 68, 68, 0.1)'
                        : token.riskScore >= 60
                        ? '1px solid rgba(249, 115, 22, 0.1)'
                        : '1px solid rgba(26, 39, 68, 0.35)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 3 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                          ${token.riskScore >= 80 ? 'bg-red-500/12 text-red-400' :
                            token.riskScore >= 60 ? 'bg-orange-500/12 text-orange-400' :
                            'bg-amber-500/12 text-amber-400'}
                        `}>
                          {token.riskScore >= 80 ? <Ban size={18} /> : <AlertTriangle size={18} />}
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">{token.name}</span>
                            <span className="text-xs text-text-muted">${token.symbol}</span>
                            <Badge variant={
                              token.riskScore >= 80 ? 'danger' :
                              token.riskScore >= 60 ? 'warning' : 'default'
                            }>
                              {token.riskScore >= 80 ? 'SCAM LIKELY' : token.riskScore >= 60 ? 'CAUTION' : 'MODERATE'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-muted capitalize">{token.chain}</span>
                            <span className="text-xs text-text-muted tabular-nums">{token.holders.toLocaleString()} holders</span>
                            <span className="text-xs text-text-muted">{token.contractAge} old</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <ScoreBar score={token.riskScore} />
                        <motion.div
                          animate={{ rotate: expanded === i ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          <ChevronDown size={16} className="text-text-muted" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="mt-4 pt-4"
                          style={{ borderTop: '1px solid rgba(26, 39, 68, 0.35)' }}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-text-muted">Risk Score</span>
                              <p className={`text-lg font-bold tabular-nums ${
                                token.riskScore >= 80 ? 'text-red-400' : 'text-orange-400'
                              }`}>{token.riskScore}/100</p>
                            </div>
                            <div>
                              <span className="text-xs text-text-muted">Liquidity Locked</span>
                              <p className={`text-sm font-medium ${token.liquidityLocked ? 'text-emerald-400' : 'text-red-400'}`}>
                                {token.liquidityLocked ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-text-muted">Contract Age</span>
                              <p className="text-sm text-text-primary">{token.contractAge}</p>
                            </div>
                            <div>
                              <span className="text-xs text-text-muted">Holders</span>
                              <p className="text-sm text-text-primary tabular-nums">{token.holders.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-text-muted mr-1">Flags:</span>
                            {token.flags.map((flag, j) => (
                              <Badge key={j} variant="danger">{flag}</Badge>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
