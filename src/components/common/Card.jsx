import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, gradient = false, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : {}}
      onClick={onClick}
      className={`
        glass-card rounded-xl p-5
        ${gradient ? 'gradient-border' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
