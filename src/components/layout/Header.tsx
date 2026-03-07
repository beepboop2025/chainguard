import { Bell, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConnectionStatus from '../common/ConnectionStatus'
import type { HeaderProps, Alert } from '../../types'

export default function Header({ title, subtitle }: HeaderProps) {
  const [alertCount] = useState(3)
  const [showAlerts, setShowAlerts] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const alerts: Alert[] = [
    { type: 'critical', msg: 'Unlimited approval to unverified contract detected', time: '2m ago' },
    { type: 'warning', msg: 'Whale sold 125K SOL ($23.4M)', time: '8m ago' },
    { type: 'info', msg: 'ETH gas dropped below 15 Gwei - optimal window', time: '12m ago' },
  ]

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search tokens, protocols..."
            className="bg-bg-card border border-border-primary rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/40 w-64 transition-colors"
          />
        </div>

        {/* Connection Status */}
        <ConnectionStatus />

        {/* Time */}
        <span className="text-xs text-text-muted font-mono hidden lg:block">
          {time.toLocaleTimeString()}
        </span>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-lg hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors"
          >
            <Bell size={18} />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 glass-card rounded-xl p-3 space-y-2 shadow-2xl"
              >
                <h4 className="text-sm font-semibold text-text-primary px-1">Alerts</h4>
                {alerts.map((a, i) => (
                  <div key={i} className={`
                    p-3 rounded-lg text-xs
                    ${a.type === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
                      a.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-blue-500/10 border border-blue-500/20'}
                  `}>
                    <p className="text-text-primary">{a.msg}</p>
                    <p className="text-text-muted mt-1">{a.time}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
