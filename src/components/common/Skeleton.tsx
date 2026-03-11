import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function Skeleton({ className = '', width, height, rounded = 'xl' }: SkeletonProps) {
  const roundedClass = `rounded-${rounded}`

  return (
    <div
      className={`animate-skeleton-wave ${roundedClass} ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 26, 46, 0.4), rgba(12, 18, 33, 0.6))',
        border: '1px solid rgba(26, 39, 68, 0.3)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton width="40%" height="0.75rem" className="mb-3" />
          <Skeleton width="60%" height="1.5rem" className="mb-2" />
          <Skeleton width="50%" height="0.75rem" />
        </div>
        <Skeleton width="2.5rem" height="2.5rem" rounded="xl" />
      </div>
    </motion.div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-2"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <Skeleton width="2rem" height="2rem" rounded="xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton width={`${60 + Math.random() * 30}%`} height="0.75rem" />
            <Skeleton width={`${40 + Math.random() * 20}%`} height="0.625rem" />
          </div>
          <Skeleton width="4rem" height="0.75rem" />
        </div>
      ))}
    </motion.div>
  )
}

export function SkeletonChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 26, 46, 0.4), rgba(12, 18, 33, 0.6))',
        border: '1px solid rgba(26, 39, 68, 0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <Skeleton width="8rem" height="0.875rem" />
          <Skeleton width="5rem" height="0.625rem" />
        </div>
        <Skeleton width="10rem" height="1.75rem" rounded="xl" />
      </div>
      <div className="h-64 flex items-end gap-1 px-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={`${20 + Math.random() * 80}%`}
            rounded="sm"
          />
        ))}
      </div>
    </motion.div>
  )
}
