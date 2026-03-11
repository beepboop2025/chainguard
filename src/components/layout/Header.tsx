import { Bell, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConnectionStatus from '../common/ConnectionStatus'
import type { HeaderProps, Alert } from '../../types'

export default function Header({ title, subtitle }: HeaderProps) {
  const [alertCount] = useState(3)
  const [showAlerts, setShowAlerts] = useState(false)
  const [time, setTime] = useState(new Date())
  const [searchFocused, setSearchFocused] = useState(false)
  const alertsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!showAlerts) return
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlerts(false)
      }
    }
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [showAlerts])

  const alerts: Alert[] = [
    { type: 'critical', msg: 'Unlimited approval to unverified contract detected', time: '2m ago' },
    { type: 'warning', msg: 'Whale sold 125K SOL ($23.4M)', time: '8m ago' },
    { type: 'info', msg: 'ETH gas dropped below 15 Gwei - optimal window', time: '12m ago' },
  ]

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(12, 18, 33, 0.85), rgba(6, 10, 19, 0.65))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26, 39, 68, 0.35)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-lg font-semibold text-text-primary"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-xs text-text-muted"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-400 ${searchFocused ? 'text-accent-blue' : 'text-text-muted'}`} />
          <input
            type="text"
            placeholder="Search tokens, protocols..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-64 transition-all duration-400"
            style={{
              background: searchFocused
                ? 'rgba(17, 26, 46, 0.9)'
                : 'rgba(17, 26, 46, 0.5)',
              border: searchFocused
                ? '1px solid rgba(59, 130, 246, 0.3)'
                : '1px solid rgba(26, 39, 68, 0.4)',
              boxShadow: searchFocused
                ? '0 0 24px rgba(59, 130, 246, 0.08), 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)'
                : 'none',
            }}
          />
        </div>

        {/* Connection Status */}
        <ConnectionStatus />

        {/* Time */}
        <motion.span
          className="text-xs text-text-muted font-mono hidden lg:block tabular-nums"
          key={time.toLocaleTimeString()}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {time.toLocaleTimeString()}
        </motion.span>

        {/* Notifications */}
        <div className="relative" ref={alertsRef}>
          <motion.button
            onClick={() => setShowAlerts(!showAlerts)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary transition-all duration-300"
            style={{
              background: showAlerts ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            }}
          >
            <Bell size={18} />
            {alertCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                }}
              >
                {alertCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute right-0 top-12 w-80 rounded-2xl p-3 space-y-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(17, 26, 46, 0.95), rgba(12, 18, 33, 0.98))',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(26, 39, 68, 0.5)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02), 0 0 30px rgba(59, 130, 246, 0.03)',
                }}
              >
                <h4 className="text-sm font-semibold text-text-primary px-1">Alerts</h4>
                {alerts.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    className={`p-3 rounded-xl text-xs transition-all duration-200 cursor-default
                      ${a.type === 'critical' ? 'bg-red-500/8 border border-red-500/15' :
                        a.type === 'warning' ? 'bg-amber-500/8 border border-amber-500/15' :
                        'bg-blue-500/8 border border-blue-500/15'}
                    `}
                  >
                    <p className="text-text-primary">{a.msg}</p>
                    <p className="text-text-muted mt-1">{a.time}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
