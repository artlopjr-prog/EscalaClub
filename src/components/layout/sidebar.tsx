'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Globe, BookOpen, MessageSquare, Calendar,
  Trophy, TrendingUp, Bell, User, ChevronLeft, ChevronRight,
  LogOut, Settings, Shield, Zap, Users, BarChart2, Megaphone,
  DollarSign, Lock, Star
} from 'lucide-react'

const C = {
  sidebar:  'var(--sidebar)',
  border:   'var(--border)',
  text:     'var(--text)',
  muted:    'var(--muted)',
  muted2:   'var(--muted2)',
  purple:   'var(--purple)',
  purple2:  '#818CF8',
  gold:     '#F0A500',
  green:    '#00D68F',
  red:      '#FF4D6A',
  bg1:      '#262B42',
}

interface Props {
  user: { id: string; username: string; display_name: string; avatar_url?: string; role_platform: string; email: string }
  unread: number
  isCreator: boolean
}

const MEMBER_NAV = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/comunidades',   icon: Globe,           label: 'Comunidades' },
  { href: '/cursos',        icon: BookOpen,        label: 'Cursos' },
  { href: '/retos',         icon: Zap,             label: 'Retos ⚡' },
  { href: '/juegos',        icon: Trophy,          label: 'Juegos 🎮' },
  { href: '/badges',        icon: Star,            label: 'Badges 🎖' },
  { href: '/comunidad',     icon: MessageSquare,   label: 'Foro' },
  { href: '/eventos',       icon: Calendar,        label: 'Eventos' },
  { href: '/leaderboard',   icon: Trophy,          label: 'Leaderboard' },
  { href: '/afiliados',     icon: TrendingUp,      label: 'Afiliados' },
]

const CREATOR_NAV = [
  { href: '/creator',                  icon: BarChart2,    label: 'Resumen' },
  { href: '/creator/anuncios',         icon: Megaphone,    label: 'Anuncios' },
  { href: '/creator/cursos',           icon: BookOpen,     label: 'Cursos' },
  { href: '/creator/comunidad',        icon: Settings,     label: 'Mi comunidad' },
  { href: '/creator/configuracion',    icon: Lock,         label: 'Permisos' },
  { href: '/creator/miembros',         icon: Users,        label: 'Miembros' },
  { href: '/eventos',                  icon: Calendar,     label: 'Eventos' },
  { href: '/creator/ingresos',         icon: DollarSign,   label: 'Ingresos' },
]

export function Sidebar({ user, unread, isCreator }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const isCreatorPath = pathname.startsWith('/creator')
  const [mode, setMode] = useState<'member'|'creator'>(isCreatorPath ? 'creator' : 'member')

  useEffect(() => {
    if (pathname.startsWith('/creator')) setMode('creator')
  }, [pathname])

  const isAdmin = user.role_platform === 'super_admin'
  const navItems = mode === 'creator' ? CREATOR_NAV : MEMBER_NAV
  const modeColor = mode === 'creator' ? C.gold : C.purple2
  const modeBg    = mode === 'creator' ? 'rgba(240,165,0,0.12)' : 'rgba(99,102,241,0.15)'
  const modeAccent = mode === 'creator' ? C.gold : C.purple

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/creator') return pathname === '/creator'
    return pathname.startsWith(href)
  }

  return (
    <div style={{
      width: collapsed ? 60 : 220,
      height: '100vh',
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '16px 0' : '16px 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {!collapsed && (
          <Link href={mode === 'creator' ? '/creator' : '/dashboard'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #6366F1, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 15, color: C.text, letterSpacing: '-0.03em' }}>EscalaClub</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'var(--bg1)', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', color: C.muted, padding: '4px 5px', display: 'flex', flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Mode toggle */}
      {isCreator && !collapsed && (
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 3, gap: 3 }}>
            <button onClick={() => { setMode('member'); router.push('/dashboard') }} style={{
              flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: mode === 'member' ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: mode === 'member' ? C.purple2 : C.muted,
              fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <User size={11} /> Miembro
            </button>
            <button onClick={() => { setMode('creator'); router.push('/creator') }} style={{
              flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: mode === 'creator' ? 'rgba(240,165,0,0.18)' : 'transparent',
              color: mode === 'creator' ? C.gold : C.muted,
              fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <Zap size={11} /> Creador
            </button>
          </div>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <div style={{ padding: '10px 16px 4px', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: modeColor, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>
          {mode === 'creator' ? '⚡ Panel Creador' : '👤 Miembro'}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px' : '9px 10px',
                borderRadius: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? modeBg : 'transparent',
                borderLeft: active && !collapsed ? `3px solid ${modeAccent}` : '3px solid transparent',
                color: active ? modeColor : C.muted2,
                transition: 'all 0.15s',
              }}>
                <item.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, fontFamily: 'Inter, sans-serif', flex: 1 }}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}

        <div style={{ height: 1, background: C.border, margin: '8px 4px' }} />

        {[
          { href: '/notificaciones', icon: Bell,   label: 'Notificaciones', badge: unread },
          { href: '/perfil',         icon: User,   label: 'Mi perfil',      badge: 0 },
          ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin', badge: 0 }] : []),
        ].map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px' : '9px 10px',
                borderRadius: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: active ? C.purple2 : C.muted,
                transition: 'all 0.15s',
              }}>
                <item.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {!collapsed && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, fontFamily: 'Inter, sans-serif', flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span style={{ background: C.purple, color: '#fff', borderRadius: 99, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>{item.badge}</span>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle */}
      {!collapsed && (
        <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button
            onClick={() => {
              const current = document.documentElement.getAttribute('data-theme') ?? 'dark'
              const next = current === 'dark' ? 'light' : 'dark'
              document.documentElement.setAttribute('data-theme', next)
              localStorage.setItem('ec-theme-v3', next)
            }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, background: 'var(--bg1)', border: `1px solid ${C.border}`, cursor: 'pointer', color: C.muted, fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            <span style={{ fontSize: 14 }}>🌓</span>
            <span>Cambiar tema</span>
          </button>
        </div>
      )}

      {/* User footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: collapsed ? '10px 0' : '12px 14px', flexShrink: 0, background: 'rgba(0,0,0,0.15)' }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 13, color: C.purple2, flexShrink: 0, overflow: 'hidden' }}>
              {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.display_name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.display_name}</div>
              <div style={{ fontSize: 10, color: modeColor, fontWeight: 600, marginTop: 1 }}>{mode === 'creator' ? '⚡ Creador' : '👤 Miembro'}</div>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" style={{ background: 'var(--bg1)', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', color: C.muted, padding: '5px 6px', display: 'flex' }}>
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8, borderRadius: 8, display: 'flex' }}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
