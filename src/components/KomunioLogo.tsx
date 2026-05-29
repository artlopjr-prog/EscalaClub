interface LogoProps {
  size?: number
  variant?: 'icon' | 'full' | 'wordmark'
  theme?: 'light' | 'dark' | 'auto'
  className?: string
}

export function KomunioLogo({ size = 32, variant = 'icon', theme = 'auto', className }: LogoProps) {
  const textColor = theme === 'dark' ? '#FFFFFF' : theme === 'light' ? '#1a1a2e' : 'var(--text)'

  const Icon = () => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad-left" cx="35%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#A855F7" />
        </radialGradient>
        <radialGradient id="grad-right" cx="65%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#7C3AED" />
        </radialGradient>
      </defs>
      {/* Left circle */}
      <circle cx="16" cy="20" r="12" fill="url(#grad-left)" opacity="0.9" />
      {/* Right circle */}
      <circle cx="26" cy="20" r="12" fill="url(#grad-right)" opacity="0.85" />
      {/* Overlap blend */}
      <circle cx="16" cy="20" r="12" fill="#C084FC" opacity="0.15" />
    </svg>
  )

  if (variant === 'icon') return <Icon />

  if (variant === 'wordmark') {
    return (
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: size * 0.55, letterSpacing: '-0.03em', color: textColor }}>
        <span style={{ color: '#7C3AED' }}>K</span>omunio
      </span>
    )
  }

  // Full lockup: icon + wordmark
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: size * 0.25 }}>
      <Icon />
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 800,
        fontSize: size * 0.5,
        letterSpacing: '-0.03em',
        color: textColor,
        lineHeight: 1,
      }}>
        <span style={{ color: '#7C3AED' }}>K</span>omunio
      </span>
    </div>
  )
}
