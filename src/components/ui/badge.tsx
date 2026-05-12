import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  primary: 'bg-ec-primary/20 text-ec-primary-light border border-ec-primary/30',
  success: 'bg-ec-success/20 text-ec-success border border-ec-success/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  danger: 'bg-ec-danger/20 text-ec-danger border border-ec-danger/30',
  neutral: 'bg-ec-surface-2 text-ec-muted border border-ec-border',
  accent: 'bg-ec-accent/20 text-ec-accent border border-ec-accent/30',
}

export function Badge({ children, variant = 'neutral', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
