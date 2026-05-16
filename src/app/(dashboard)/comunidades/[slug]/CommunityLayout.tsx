'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Bell, Users, BookOpen, Calendar, Trophy, Info, Radio, HelpCircle, MessageCircle } from 'lucide-react'

const C = {
  bg: '#1F2335', bg1: '#262B42', bg2: '#2D3452',
  border: 'rgba(255,255,255,0.08)', text: '#E8E9F0',
  muted: '#7B7FA8', muted2: '#A8AACC',
  purple: '#6366F1', purple2: '#818CF8',
}

interface Props {
  community: {
    id: string; name: string; slug: string; logo_url?: string
    banner_url?: string; primary_color?: string; member_count?: number
    description?: string; owner_id: string; tagline?: string
  }
  ownerProfile: { display_name: string; avatar_url?: string } | null
  isOwner: boolean
  isMember: boolean
  children: React.ReactNode
}

export default function CommunityLayout({ community, ownerProfile, isOwner, isMember, children }: Props) {
  const pathname = usePathname()
  const accent = community.primary_color ?? '#6366F1'
  const slug = community.slug

  const TABS = [
    { href: `/comunidades/${slug}/foro`,   label: 'Comunidad',  icon: MessageCircle },
    { href: `/comunidades/${slug}/cursos`, label: 'Cursos',     icon: BookOpen },
    { href: `/comunidades/${slug}/calendario`, label: 'Calendario', icon: Calendar },
    { href: `/comunidades/${slug}/miembros-lista`, label: 'Miembros', icon: Users },
    { href: `/comunidades/${slug}/ranking`, label: 'Ranking',   icon: Trophy },
    { href: `/comunidades/${slug}`,        label: 'Info',       icon: Info },
  ]

  const isActive = (href: string) => {
    if (href === `/comunidades/${slug}`) return pathname === `/comunidades/${slug}`
    return pathname.startsWith(href)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Top navbar */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 20 }}>
        {/* Community header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderBottom: `1px solid ${C.border}` }}>
          {/* Logo */}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: community.logo_url ? undefined : accent + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden', flexShrink: 0, border: `1px solid ${accent}40` }}>
            {community.logo_url ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
          </div>
          {/* Name + chevron */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 16, color: C.text, letterSpacing: '-0.02em' }}>{community.name}</span>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(0,214,143,0.12)', color: '#00D68F', fontWeight: 700 }}>● Activa</span>
            </div>
            {community.tagline && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{community.tagline}</p>}
          </div>
          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOwner && (
              <Link href="/creator" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: `1px solid rgba(99,102,241,0.25)`, color: C.purple2, textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                <Settings size={13} /> Panel Creador
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '0 24px', overflowX: 'auto' }}>
          {TABS.map(tab => {
            const active = isActive(tab.href)
            return (
              <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px',
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  color: active ? C.text : C.muted,
                  borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                  transition: 'all 0.15s', cursor: 'pointer',
                  fontFamily: active ? 'Inter, sans-serif' : 'Inter, sans-serif',
                }}>
                  <tab.icon size={14} />
                  {tab.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
