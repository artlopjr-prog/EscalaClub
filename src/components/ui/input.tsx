import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-ec-text/80 font-display">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ec-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-ec-surface-2 border border-ec-border rounded-xl px-4 py-3 text-ec-text placeholder:text-ec-muted',
              'focus:outline-none focus:border-ec-primary/60 focus:bg-ec-surface-3',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-ec-danger/50 focus:border-ec-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-ec-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-ec-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
