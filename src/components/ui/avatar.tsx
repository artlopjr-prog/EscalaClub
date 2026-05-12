import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  level?: number
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ name, src, size = 'md', className, level }: AvatarProps) {
  const initials = getInitials(name)

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div className={cn(
        'rounded-full overflow-hidden flex items-center justify-center font-display font-bold',
        'bg-gradient-to-br from-ec-primary to-purple-800 text-white',
        sizeMap[size]
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {level && (
        <div className="absolute -bottom-1 -right-1 level-badge text-ec-bg text-xs rounded-full w-5 h-5 flex items-center justify-center font-display font-black">
          {level}
        </div>
      )}
    </div>
  )
}
