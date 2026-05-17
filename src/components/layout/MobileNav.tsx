'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Globe, BookOpen, Trophy, MoreHorizontal, X, Zap, Calendar, TrendingUp, Bell, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const C = {
  bg: '#1F2335', bg1: '#262B42', bg2: '#2D3452',
  border: 'var(--border)', text: 'var(--text)',
  muted: '#7B7FA8', purple: '#6366F1', purple2: '#818CF8',
}

const NAV = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Inicio' },
  { href: '/comunidades', icon: Globe,            label: 'Comunidades' },
  { href: '/cursos',      icon: BookOpen,         label: 'Cursos' },
  { href: '/leaderboard', icon: Trophy,           label: 'Ranking' },
]

const MORE_MEMBER = [
  { href: '/eventos',        icon: Calendar,   label: 'Eventos' },
  { href: '/afiliados',      icon: TrendingUp, label: 'Afiliados' },
  { href: '/notificaciones', icon: Bell,       label: 'Notificaciones' },
  { href: '/perfil',         icon: User,       label: 'Mi perfil' },
]

const MORE_CREATOR = [
  { href: '/creator',              icon: Zap,        label: 'Panel Creador' },
  { href: '/creator/comunidad',    icon: Globe,      label: 'Mi comunidad' },
  { href: '/creator/miembros',     icon: User,       label: 'Miembros' },
  { href: '/creator/ingresos',     icon: TrendingUp, label: 'Ingresos' },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    supabase.from('ec_profiles').select('role_platform').then(({ data }) => {
      // Check from DOM if creator toggle is visible
    })
    supabase.from('ec_communities').select('id').then(({ data }) => {
      setIsCreator((data?.length ?? 0) > 0)
    })
  }, [])

  if (!isMobile) return null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Bottom nav bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: `rgba(24,27,46,0.97)`,
        backdropFilter: 'blur(24px)',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 8px max(16px, env(safe-area-inset-bottom))',
      }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 14px', borderRadius: 10, minWidth: 52 }}>
              <item.icon size={21} color={active ? C.purple2 : C.muted} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? C.purple2 : C.muted, fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => setMenuOpen(true)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 14px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', minWidth: 52 }}
        >
          <MoreHorizontal size={21} color={C.muted} strokeWidth={1.8} />
          <span style={{ fontSize: 10, color: C.muted, fontFamily: 'Inter, sans-serif' }}>Más</span>
        </button>
      </nav>

      {/* More menu — bottom sheet */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 60, backdropFilter: 'blur(6px)' }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 70,
            background: C.bg1,
            borderRadius: '24px 24px 0 0',
            border: `1px solid ${C.border}`,
            padding: '0 0 max(24px, env(safe-area-inset-bottom))',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 16px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 17, color: C.text }}>Menú</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'var(--border)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 7px', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color={C.muted} />
              </button>
            </div>

            {/* Member section */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
                👤 Miembro
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MORE_MEMBER.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14, background: C.bg2, border: `1px solid ${C.border}`, textDecoration: 'none' }}
                  >
                    <item.icon size={18} color={C.purple2} strokeWidth={1.8} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Creator section */}
            {isCreator && (
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <div style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#F0A500', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
                  ⚡ Creador
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {MORE_CREATOR.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14, background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.15)', textDecoration: 'none' }}
                    >
                      <item.icon size={18} color="#F0A500" strokeWidth={1.8} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Logout */}
            <div style={{ padding: '0 16px', borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 14px', borderRadius: 14, background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.15)', cursor: 'pointer' }}
              >
                <LogOut size={18} color="#FF4D6A" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FF4D6A' }}>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
