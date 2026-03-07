import { motion } from 'framer-motion'

export default function RiskGauge({ score, size = 140 }) {
  const radius = (size - 20) / 2
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#f59e0b'
    if (s >= 40) return '#f97316'
    return '#ef4444'
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Safe'
    if (s >= 60) return 'Moderate'
    if (s >= 40) return 'Risky'
    return 'Danger'
  }

  const color = getColor(score)

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <motion.path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-text-secondary">{getLabel(score)}</span>
      </div>
    </div>
  )
}
