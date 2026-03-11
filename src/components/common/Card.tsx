import { motion } from 'framer-motion'
import { useRef, useCallback } from 'react'
import type { CardProps } from '../../types'

export default function Card({ children, className = '', hover = true, gradient = false, onClick }: CardProps) {
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? {
        y: -3,
        transition: { duration: 0.25, ease: 'easeOut' },
      } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`
        rounded-2xl p-5 transition-all duration-500 card-spotlight
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: gradient
          ? 'linear-gradient(135deg, rgba(17, 26, 46, 0.8), rgba(12, 18, 33, 0.9), rgba(17, 26, 46, 0.7))'
          : 'linear-gradient(135deg, rgba(17, 26, 46, 0.6), rgba(12, 18, 33, 0.8))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: gradient
          ? '1px solid rgba(59, 130, 246, 0.15)'
          : '1px solid rgba(26, 39, 68, 0.5)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
