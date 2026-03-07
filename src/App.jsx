import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Security from './pages/Security'
import WhaleTracker from './pages/WhaleTracker'
import GasOptimizer from './pages/GasOptimizer'
import ThreatScanner from './pages/ThreatScanner'

export default function App() {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 ml-[240px] min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/security" element={<Security />} />
            <Route path="/whales" element={<WhaleTracker />} />
            <Route path="/gas" element={<GasOptimizer />} />
            <Route path="/threats" element={<ThreatScanner />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}
