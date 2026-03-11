import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Shield, Activity, Fuel, AlertTriangle,
  Wallet, ChevronRight
} from 'lucide-react'
import type { NavItem } from '../../types'

const navItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/security', icon: Shield, label: 'Security' },
  { path: '/whales', icon: Activity, label: 'Whale Tracker' },
  { path: '/gas', icon: Fuel, label: 'Gas Optimizer' },
  { path: '/threats', icon: AlertTriangle, label: 'Threat Scanner' },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export default function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(12, 18, 33, 0.95) 0%, rgba(6, 10, 19, 0.98) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(26, 39, 68, 0.4)',
        boxShadow: '4px 0 32px rgba(0, 0, 0, 0.35), 1px 0 0 rgba(255, 255, 255, 0.02)',
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4" style={{ borderBottom: '1px solid rgba(26, 39, 68, 0.35)' }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35), 0 0 25px rgba(59, 130, 246, 0.12)',
            }}
          >
            <Shield size={20} className="text-white relative z-10" />
            {/* Ambient glow ring */}
            <div
              className="absolute inset-0 rounded-xl animate-glow-pulse"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                filter: 'blur(8px)',
                opacity: 0.3,
                zIndex: 0,
              }}
            />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <h1 className="text-lg font-bold gradient-text whitespace-nowrap tracking-tight">ChainGuard</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ path, icon: Icon, label }, idx) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
              ${isActive
                ? 'text-white'
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(6, 182, 212, 0.06))',
                      border: '1px solid rgba(59, 130, 246, 0.18)',
                      boxShadow: '0 0 24px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Hover Background - enhanced glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-400 border border-transparent group-hover:border-white/[0.05] group-hover:shadow-[0_0_12px_rgba(59,130,246,0.04)]" />
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      background: 'linear-gradient(180deg, #3b82f6, #06b6d4)',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.6), 2px 0 8px rgba(59, 130, 246, 0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'text-accent-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'group-hover:drop-shadow-[0_0_4px_rgba(59,130,246,0.3)]'
                    }`}
                  />
                </motion.div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="relative z-10 text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider with gradient */}
      <div className="mx-3 mb-2">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.12), transparent)' }} />
      </div>

      {/* Wallet Connection */}
      <div className="px-2 pb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 btn-glow"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(6, 182, 212, 0.06))',
            border: '1px solid rgba(59, 130, 246, 0.12)',
          }}
        >
          <div className="relative flex-shrink-0">
            <Wallet size={18} className="text-blue-400" />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
              animate={{
                boxShadow: ['0 0 4px rgba(16, 185, 129, 0.4)', '0 0 8px rgba(16, 185, 129, 0.7)', '0 0 4px rgba(16, 185, 129, 0.4)'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium text-blue-400 font-mono"
              >
                0x28c6...e9a1
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Button */}
      <div style={{ borderTop: '1px solid rgba(26, 39, 68, 0.35)' }} className="p-2">
        <motion.button
          onClick={onToggleCollapsed}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.04)' }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center p-2 rounded-xl text-text-muted hover:text-text-primary transition-colors duration-300"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ChevronRight size={18} />
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  )
}
