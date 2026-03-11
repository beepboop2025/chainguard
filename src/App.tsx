import { useState } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Security from './pages/Security'
import WhaleTracker from './pages/WhaleTracker'
import GasOptimizer from './pages/GasOptimizer'
import ThreatScanner from './pages/ThreatScanner'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(6px)',
    transition: {
      duration: 0.3,
      ease: [0.55, 0, 1, 0.45] as const,
    },
  },
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

function NotFound() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <motion.div
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 glow-amber"
            animate={{
              boxShadow: [
                '0 0 15px rgba(245, 158, 11, 0.15), 0 0 30px rgba(245, 158, 11, 0.05)',
                '0 0 25px rgba(245, 158, 11, 0.25), 0 0 50px rgba(245, 158, 11, 0.1)',
                '0 0 15px rgba(245, 158, 11, 0.15), 0 0 30px rgba(245, 158, 11, 0.05)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AlertTriangle size={48} className="text-amber-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">404 -- Page Not Found</h1>
          <p className="text-text-muted mb-8">The page you are looking for does not exist.</p>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-accent-blue/15 text-accent-blue text-sm font-medium hover:bg-accent-blue/25 transition-all duration-300 border border-accent-blue/20 hover:border-accent-blue/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default function App() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed(c => !c)} />
      <main
        className="flex-1 min-h-screen transition-[margin-left] duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/security" element={<PageWrapper><Security /></PageWrapper>} />
            <Route path="/whales" element={<PageWrapper><WhaleTracker /></PageWrapper>} />
            <Route path="/gas" element={<PageWrapper><GasOptimizer /></PageWrapper>} />
            <Route path="/threats" element={<PageWrapper><ThreatScanner /></PageWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}
