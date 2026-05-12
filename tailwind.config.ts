import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      colors: {
        ec: {
          bg:       'var(--bg)',
          bg1:      'var(--bg1)',
          bg2:      'var(--bg2)',
          bg3:      'var(--bg3)',
          border:   'var(--border)',
          border2:  'var(--border2)',
          text:     'var(--text)',
          muted:    'var(--muted)',
          muted2:   'var(--muted2)',
          purple:   'var(--purple)',
          purple2:  'var(--purple2)',
          gold:     'var(--gold)',
          green:    'var(--green)',
          red:      'var(--red)',
          // legacy aliases so existing code doesn't break
          primary:        'var(--purple)',
          'primary-light':'var(--purple2)',
          accent:         'var(--gold)',
          success:        'var(--green)',
          danger:         'var(--red)',
          surface:        'var(--bg1)',
          'surface-2':    'var(--bg2)',
          'surface-3':    'var(--bg3)',
        },
      },
      boxShadow: {
        glow:    'var(--glow-purple)',
        'glow-sm':'var(--glow-sm)',
        card:    '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'scale-in':  'scaleIn 0.3s ease forwards',
        'float':     'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'shimmer':   'shimmer 1.5s infinite',
      },
      backgroundImage: {
        'grad-purple': 'var(--grad-purple)',
        'grad-gold':   'var(--grad-gold)',
        'grad-mesh':   'var(--grad-mesh)',
      },
    },
  },
  plugins: [],
}

export default config
