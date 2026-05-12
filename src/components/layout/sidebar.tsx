'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Globe, BookOpen, MessageSquare, Calendar,
  Trophy, TrendingUp, Bell, User, ChevronLeft, ChevronRight,
  LogOut, Settings, Shield, Zap, Users, BarChart2, Megaphone,
  DollarSign, Radio, HelpCircle, MessageCircle, Lock
} from 'lucide-react'

const C = {
  bg: '#0D0D14', border: 'rgba(255,255,255,0.07)',
  text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0',
  purple: '#7C3AED', purple2: '#9F67FF', gold: '#F0A500',
  green: '#00D68F', red: '#FF4D6A', bg2: '#13131C'
}

interface Props {
  user: { id: string; username: string; display_name: string; avatar_url?: string; role_platform: string; email: string }
  unread: number
  isCreator: boolean
}

const MEMBER_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/comunidades', icon: Globe, label: 'Comunidades' },
  { href: '/cursos', icon: BookOpen, label: 'Cursos' },
  { href: '/comunidad', icon: MessageSquare, label: 'Foro' },
  { href: '/eventos', icon: Calendar, label: 'Eventos' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/afiliados', icon: TrendingUp, label: 'Afiliados' },
]

const CREATOR_NAV = [
  { href: '/creator', icon: BarChart2, label: 'Resumen' },
  { href: '/creator/anuncios', icon: Megaphone, label: 'Anuncios' },
  { href: '/creator/cursos', icon: BookOpen, label: 'Cursos' },
  { href: '/creator/comunidad', icon: Settings, label: 'Mi comunidad' },
  { href: '/creator/configuracion', icon: Lock, label: 'Permisos' },
  { href: '/creator/miembros', icon: Users, label: 'Miembros' },
  { href: '/eventos', icon: Calendar, label: 'Eventos' },
  { href: '/creator/ingresos', icon: DollarSign, label: 'Ingresos' },
]

export function Sidebar({ user, unread, isCreator }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  // Determine mode from URL — creator paths start with /creator
  const isCreatorPath = pathname.startsWith('/creator')
  const [mode, setMode] = useState<'member' | 'creator'>(isCreatorPath ? 'creator' : 'member')

  // Sync mode with URL changes
  useEffect(() => {
    if (pathname.startsWith('/creator')) setMode('creator')
  }, [pathname])

  const isAdmin = user.role_platform === 'super_admin'
  const navItems = mode === 'creator' ? CREATOR_NAV : MEMBER_NAV
  const modeColor = mode === 'creator' ? C.gold : C.purple2
  const modeBg = mode === 'creator' ? 'rgba(240,165,0,0.12)' : 'rgba(124,58,237,0.12)'
  const modeBorder = mode === 'creator' ? 'rgba(240,165,0,0.3)' : 'rgba(124,58,237,0.3)'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function switchToMember() {
    setMode('member')
    router.push('/dashboard')
  }

  function switchToCreator() {
    setMode('creator')
    router.push('/creator')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/creator') return pathname === '/creator'
    return pathname.startsWith(href)
  }

  return (
    <div style={{
      width: collapsed ? 64 : 220,
      height: '100vh',
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '16px 0' : '16px 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {!collapsed && (
          <Link href={mode === 'creator' ? '/creator' : '/dashboard'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 15, color: C.text, letterSpacing: '-0.03em' }}>EscalaClub</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Mode toggle — only show if user is creator */}
      {isCreator && !collapsed && (
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3, gap: 3 }}>
            <button onClick={switchToMember} style={{
              flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: mode === 'member' ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: mode === 'member' ? C.purple2 : C.muted,
              fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700,
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}>
              <User size={11} /> Miembro
            </button>
            <button onClick={switchToCreator} style={{
              flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: mode === 'creator' ? 'rgba(240,165,0,0.2)' : 'transparent',
              color: mode === 'creator' ? C.gold : C.muted,
              fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700,
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}>
              <Zap size={11} /> Creador
            </button>
          </div>
        </div>
      )}

      {/* Mode label */}
      {!collapsed && (
        <div style={{ padding: '8px 14px 4px', fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: modeColor, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, opacity: 0.8 }}>
          {mode === 'creator' ? '⚡ Panel Creador' : '👤 Miembro'}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block', padding: collapsed ? '4px 0' : '2px 8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px' : '9px 10px',
                borderRadius: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? modeBg : 'transparent',
                borderLeft: active && !collapsed ? `3px solid ${modeColor}` : '3px solid transparent',
                color: active ? modeColor : C.muted2,
                transition: 'all 0.15s',
              }}>
                <item.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, fontFamily: 'Plus Jakarta Sans, sans-serif', flex: 1 }}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Divider */}
        <div style={{ height: 1, background: C.border, margin: '8px 12px' }} />

        {/* Common items — both modes */}
        {[
          { href: '/notificaciones', icon: Bell, label: 'Notificaciones', badge: unread },
          { href: '/perfil', icon: User, label: 'Mi perfil', badge: 0 },
          ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin', badge: 0 }] : []),
        ].map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block', padding: collapsed ? '4px 0' : '2px 8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px' : '9px 10px',
                borderRadius: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                color: active ? C.purple2 : C.muted,
                transition: 'all 0.15s',
              }}>
                <item.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {!collapsed && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, fontFamily: 'Plus Jakarta Sans, sans-serif', flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && <span style={{ background: C.purple, color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{item.badge}</span>}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: collapsed ? '10px 0' : '12px', flexShrink: 0 }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: C.purple2, flexShrink: 0, overflow: 'hidden' }}>
              {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.display_name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.display_name}</div>
              <div style={{ fontSize: 10, color: modeColor, fontWeight: 600 }}>{mode === 'creator' ? '⚡ Creador' : '👤 Miembro'}</div>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 6, display: 'flex', flexShrink: 0 }}>
              <LogOut size={14} />
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
