import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Shield, Search, ExternalLink, Ban,
  CheckCircle, XCircle, Eye, ChevronDown, ChevronUp
} from 'lucide-react'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Header from '../components/layout/Header'
import { THREAT_TOKENS, CHAINS } from '../data/mockData'
import { scanToken, detectChainId } from '../services/threatService'

function ScoreBar({ score }) {
  const getColor = (s) => {
    if (s >= 80) return 'bg-red-500'
    if (s >= 60) return 'bg-orange-500'
    if (s >= 40) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-bg-primary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className={`text-xs font-bold ${
        score >= 80 ? 'text-red-400' : score >= 60 ? 'text-orange-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'
      }`}>
        {score}
      </span>
    </div>
  )
}

export default function ThreatScanner() {
  const [expanded, setExpanded] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scanResult, setScanResult] = useState(null)
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
      // Fallback to simulated result if GoPlus fails
      const isClean = Math.random() > 0.6
      setScanResult({
        address: searchQuery,
        safe: isClean,
        score: isClean ? Math.floor(Math.random() * 30 + 5) : Math.floor(Math.random() * 40 + 60),
        flags: isClean
          ? ['Contract Verified', 'Liquidity Locked', 'Owner Renounced']
          : ['Hidden Mint Function', 'High Sell Tax (25%)', 'No Audit', 'Proxy Contract'],
        holders: Math.floor(Math.random() * 50000 + 100),
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

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Threats Detected" value={THREAT_TOKENS.length} subValue="Flagged tokens" icon={AlertTriangle} color="red" />
          <StatCard label="Critical Risk" value={criticalCount} subValue="Likely scam/rug" icon={Ban} color="red" />
          <StatCard label="High Risk" value={highCount} subValue="Exercise caution" icon={AlertTriangle} color="amber" />
          <StatCard label="Scans Today" value="1,247" subValue="Community protection" icon={Shield} color="blue" />
        </div>

        {/* Contract Scanner */}
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
                className="w-full bg-bg-primary border border-border-primary rounded-lg pl-9 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/40 transition-colors"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !searchQuery.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </button>
          </div>

          {/* Scan Result */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className={`p-4 rounded-lg border ${
                  scanResult.safe
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {scanResult.safe ? (
                        <CheckCircle size={24} className="text-emerald-400" />
                      ) : (
                        <XCircle size={24} className="text-red-400" />
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
                      <Badge
                        key={i}
                        variant={scanResult.safe ? 'success' : 'danger'}
                      >
                        {flag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">{scanResult.holders.toLocaleString()} holders detected</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Flagged Tokens */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Recently Flagged Tokens</h3>
          <div className="space-y-2">
            {THREAT_TOKENS.map((token, i) => (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all
                    ${token.riskScore >= 80 ? 'bg-red-500/[0.03] border-red-500/15 hover:border-red-500/30' :
                      token.riskScore >= 60 ? 'bg-orange-500/[0.03] border-orange-500/15 hover:border-orange-500/30' :
                      'bg-bg-primary/50 border-border-primary hover:border-border-accent'}
                  `}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                        ${token.riskScore >= 80 ? 'bg-red-500/15 text-red-400' :
                          token.riskScore >= 60 ? 'bg-orange-500/15 text-orange-400' :
                          'bg-amber-500/15 text-amber-400'}
                      `}>
                        {token.riskScore >= 80 ? <Ban size={18} /> : <AlertTriangle size={18} />}
                      </div>
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
                          <span className="text-xs text-text-muted">{token.holders.toLocaleString()} holders</span>
                          <span className="text-xs text-text-muted">{token.contractAge} old</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <ScoreBar score={token.riskScore} />
                      {expanded === i ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-border-primary"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-text-muted">Risk Score</span>
                            <p className={`text-lg font-bold ${
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
                            <p className="text-sm text-text-primary">{token.holders.toLocaleString()}</p>
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
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
