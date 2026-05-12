'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Globe, BookOpen, Trophy, MoreHorizontal, X, Zap, Calendar, TrendingUp, Bell, User } from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Inicio' },
  { href: '/comunidades', icon: Globe,            label: 'Comunidades' },
  { href: '/cursos',      icon: BookOpen,         label: 'Cursos' },
  { href: '/leaderboard', icon: Trophy,           label: 'Ranking' },
]

const MORE = [
  { href: '/eventos',        icon: Calendar,   label: 'Eventos' },
  { href: '/afiliados',      icon: TrendingUp, label: 'Afiliados' },
  { href: '/notificaciones', icon: Bell,       label: 'Notificaciones' },
  { href: '/perfil',         icon: User,       label: 'Mi perfil' },
  { href: '/creator',        icon: Zap,        label: 'Panel Creador' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile) return null

  return (
    <>
      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 4px 16px',
      }}>
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 12px', borderRadius: 10, transition: 'all 0.15s' }}>
              <item.icon size={20} color={active ? '#9F67FF' : '#6B6A80'} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#9F67FF' : '#6B6A80', fontFamily: 'Syne, sans-serif' }}>{item.label}</span>
            </Link>
          )
        })}
        <button onClick={() => setMenuOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <MoreHorizontal size={20} color="#6B6A80" />
          <span style={{ fontSize: 10, color: '#6B6A80', fontFamily: 'Syne, sans-serif' }}>Más</span>
        </button>
      </nav>

      {/* More menu overlay */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 60, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 70, background: '#0D0D14', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 16px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#EEEDF5' }}>Más opciones</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="#9998B0" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {MORE.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: '#13131C', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
                  <item.icon size={18} color="#9F67FF" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#EEEDF5' }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
