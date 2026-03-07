import { motion } from 'framer-motion'
import type { StatCardProps, StatCardColor } from '../../types'

const colorMap: Record<StatCardColor, string> = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  red: 'from-red-500/20 to-red-600/5 border-red-500/20',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
}

const iconColorMap: Record<StatCardColor, string> = {
  blue: 'text-blue-400 bg-blue-500/15',
  cyan: 'text-cyan-400 bg-cyan-500/15',
  emerald: 'text-emerald-400 bg-emerald-500/15',
  amber: 'text-amber-400 bg-amber-500/15',
  red: 'text-red-400 bg-red-500/15',
  purple: 'text-purple-400 bg-purple-500/15',
}

export default function StatCard({ label, value, subValue, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subValue && (
            <p className={`text-sm mt-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'}`}>
              {subValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconColorMap[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
