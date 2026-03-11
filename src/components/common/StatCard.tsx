import { motion, useMotionValue, animate } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { StatCardProps, StatCardColor } from '../../types'

const colorMap: Record<StatCardColor, { bg: string; border: string; borderHover: string; glow: string; iconBg: string; iconText: string; accentLine: string }> = {
  blue: {
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.10), rgba(59, 130, 246, 0.02))',
    border: 'rgba(59, 130, 246, 0.12)',
    borderHover: 'rgba(59, 130, 246, 0.30)',
    glow: '0 4px 24px rgba(59, 130, 246, 0.12), 0 0 40px rgba(59, 130, 246, 0.04)',
    iconBg: 'rgba(59, 130, 246, 0.12)',
    iconText: '#60a5fa',
    accentLine: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
  },
  cyan: {
    bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.10), rgba(6, 182, 212, 0.02))',
    border: 'rgba(6, 182, 212, 0.12)',
    borderHover: 'rgba(6, 182, 212, 0.30)',
    glow: '0 4px 24px rgba(6, 182, 212, 0.12), 0 0 40px rgba(6, 182, 212, 0.04)',
    iconBg: 'rgba(6, 182, 212, 0.12)',
    iconText: '#22d3ee',
    accentLine: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
  },
  emerald: {
    bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.10), rgba(16, 185, 129, 0.02))',
    border: 'rgba(16, 185, 129, 0.12)',
    borderHover: 'rgba(16, 185, 129, 0.30)',
    glow: '0 4px 24px rgba(16, 185, 129, 0.12), 0 0 40px rgba(16, 185, 129, 0.04)',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconText: '#34d399',
    accentLine: 'linear-gradient(90deg, #10b981, #06b6d4)',
  },
  amber: {
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.10), rgba(245, 158, 11, 0.02))',
    border: 'rgba(245, 158, 11, 0.12)',
    borderHover: 'rgba(245, 158, 11, 0.30)',
    glow: '0 4px 24px rgba(245, 158, 11, 0.12), 0 0 40px rgba(245, 158, 11, 0.04)',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconText: '#fbbf24',
    accentLine: 'linear-gradient(90deg, #f59e0b, #f97316)',
  },
  red: {
    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.10), rgba(239, 68, 68, 0.02))',
    border: 'rgba(239, 68, 68, 0.12)',
    borderHover: 'rgba(239, 68, 68, 0.30)',
    glow: '0 4px 24px rgba(239, 68, 68, 0.12), 0 0 40px rgba(239, 68, 68, 0.04)',
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconText: '#f87171',
    accentLine: 'linear-gradient(90deg, #ef4444, #f97316)',
  },
  purple: {
    bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.10), rgba(139, 92, 246, 0.02))',
    border: 'rgba(139, 92, 246, 0.12)',
    borderHover: 'rgba(139, 92, 246, 0.30)',
    glow: '0 4px 24px rgba(139, 92, 246, 0.12), 0 0 40px rgba(139, 92, 246, 0.04)',
    iconBg: 'rgba(139, 92, 246, 0.12)',
    iconText: '#a78bfa',
    accentLine: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
  },
}

function AnimatedNumber({ value }: { value: string | number }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
  const isNumeric = !isNaN(numericValue) && typeof value === 'number'
  const prefix = typeof value === 'string' ? value.match(/^[^0-9.-]*/)?.[0] || '' : ''
  const suffix = typeof value === 'string' ? value.match(/[^0-9.-]*$/)?.[0] || '' : ''

  const motionValue = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState(String(value))

  useEffect(() => {
    if (isNumeric) {
      const controls = animate(motionValue, numericValue, {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (v) => setDisplayValue(String(Math.round(v))),
      })
      return controls.stop
    } else if (typeof value === 'string' && !isNaN(numericValue)) {
      const controls = animate(motionValue, numericValue, {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (v) => {
          const formatted = numericValue >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) :
            numericValue >= 1 ? v.toFixed(2) : v.toFixed(4)
          setDisplayValue(`${prefix}${formatted}${suffix}`)
        },
      })
      return controls.stop
    } else {
      setDisplayValue(String(value))
    }
  }, [value, numericValue, isNumeric, prefix, suffix])

  return <>{displayValue}</>
}

export default function StatCard({ label, value, subValue, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const colors = colorMap[color]
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className="rounded-2xl p-5 transition-all duration-500 relative overflow-hidden card-spotlight"
      style={{
        background: colors.bg,
        border: `1px solid ${hovered ? colors.borderHover : colors.border}`,
        boxShadow: hovered
          ? `${colors.glow}, 0 8px 32px rgba(0, 0, 0, 0.2)`
          : '0 2px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-full"
        style={{ background: colors.accentLine }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Subtle shimmer overlay on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent, rgba(255,255,255,0.01))',
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-secondary mb-1.5 tracking-wide">{label}</p>
          <motion.p
            className="text-2xl font-bold text-text-primary tabular-nums"
            key={String(value)}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedNumber value={value} />
          </motion.p>
          {subValue && (
            <motion.p
              className={`text-sm mt-1.5 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {subValue}
            </motion.p>
          )}
        </div>
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2.5 rounded-xl transition-all duration-500 flex-shrink-0"
            style={{
              background: colors.iconBg,
              color: colors.iconText,
              boxShadow: hovered ? `0 0 16px ${colors.iconBg}` : 'none',
            }}
          >
            <Icon size={20} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
