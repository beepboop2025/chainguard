import { motion, useMotionValue, animate } from 'framer-motion'
import { useState, useEffect, useId } from 'react'
import type { RiskGaugeProps } from '../../types'

export default function RiskGauge({ score, size = 140 }: RiskGaugeProps) {
  const radius = (size - 20) / 2
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const filterId = useId()

  const getColor = (s: number): string => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#f59e0b'
    if (s >= 40) return '#f97316'
    return '#ef4444'
  }

  const getLabel = (s: number): string => {
    if (s >= 80) return 'Safe'
    if (s >= 60) return 'Moderate'
    if (s >= 40) return 'Risky'
    return 'Danger'
  }

  const getGlowColor = (s: number): string => {
    if (s >= 80) return 'rgba(16, 185, 129, 0.4)'
    if (s >= 60) return 'rgba(245, 158, 11, 0.4)'
    if (s >= 40) return 'rgba(249, 115, 22, 0.4)'
    return 'rgba(239, 68, 68, 0.4)'
  }

  const color = getColor(score)
  const glowColor = getGlowColor(score)

  // Animated counter
  const motionValue = useMotionValue(0)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, score, {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    })
    return controls.stop
  }, [score])

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <defs>
          <filter id={`glow-${filterId}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`arc-grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="50%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="rgba(26, 39, 68, 0.5)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Foreground arc with glow */}
        <motion.path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={`url(#arc-grad-${filterId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          filter={`url(#glow-${filterId})`}
          style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.span
          className="text-3xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 24px ${glowColor}` }}
        >
          {displayScore}
        </motion.span>
        <span className="text-xs text-text-secondary font-medium">{getLabel(score)}</span>
      </div>
    </motion.div>
  )
}
