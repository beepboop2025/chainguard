import type { BadgeProps, BadgeVariant } from '../../types'

const variants: Record<BadgeVariant, { classes: string; glow: string }> = {
  default: { classes: 'bg-slate-500/8 text-slate-300 border-slate-500/12', glow: 'none' },
  success: { classes: 'bg-emerald-500/8 text-emerald-400 border-emerald-500/12', glow: '0 0 8px rgba(16, 185, 129, 0.08)' },
  warning: { classes: 'bg-amber-500/8 text-amber-400 border-amber-500/12', glow: '0 0 8px rgba(245, 158, 11, 0.08)' },
  danger: { classes: 'bg-red-500/8 text-red-400 border-red-500/12', glow: '0 0 8px rgba(239, 68, 68, 0.08)' },
  info: { classes: 'bg-blue-500/8 text-blue-400 border-blue-500/12', glow: '0 0 8px rgba(59, 130, 246, 0.08)' },
  purple: { classes: 'bg-purple-500/8 text-purple-400 border-purple-500/12', glow: '0 0 8px rgba(139, 92, 246, 0.08)' },
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const v = variants[variant]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${v.classes} ${className}`}
      style={{ boxShadow: v.glow }}
    >
      {children}
    </span>
  )
}
