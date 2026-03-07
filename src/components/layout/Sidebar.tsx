import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Shield, Activity, Fuel, AlertTriangle,
  Wallet, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import type { NavItem } from '../../types'

const navItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/security', icon: Shield, label: 'Security' },
  { path: '/whales', icon: Activity, label: 'Whale Tracker' },
  { path: '/gas', icon: Fuel, label: 'Gas Optimizer' },
  { path: '/threats', icon: AlertTriangle, label: 'Threat Scanner' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border-primary z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border-primary">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-lg font-bold gradient-text whitespace-nowrap">ChainGuard</h1>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
              ${isActive
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent'
              }
            `}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Wallet Connection */}
      <div className="px-2 pb-3">
        <button className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
          bg-gradient-to-r from-blue-600/20 to-cyan-600/20
          border border-blue-500/20 text-blue-400
          hover:from-blue-600/30 hover:to-cyan-600/30
          transition-all duration-150
        `}>
          <Wallet size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">0x28c6...e9a1</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <div className="border-t border-border-primary p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  )
}
