'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, MessageSquare, BookOpen, Calendar, Users, Trophy, Info, LogOut } from 'lucide-react'

interface Props {
  community: {
    id: string; name: string; slug: string
    logo_url?: string; banner_url?: string; cover_url?: string
    primary_color?: string; bg_color?: string; bg_image_url?: string
    member_count?: number; tagline?: string; owner_id: string
    card_style?: string
  }
  ownerProfile: { display_name: string; avatar_url?: string } | null
  isOwner: boolean
  isMember: boolean
  children: React.ReactNode
}

export default function CommunityShell({ community, ownerProfile, isOwner, isMember, children }: Props) {
  const pathname = usePathname()
  const slug = community.slug
  const accent = community.primary_color ?? '#6366F1'
  const bgColor = community.bg_color ?? '#1F2335'

  const TABS = [
    { href: `/comunidades/${slug}/foro`,      label: 'Comunidad',  icon: MessageSquare },
    { href: `/comunidades/${slug}/cursos`,     label: 'Cursos',     icon: BookOpen },
    { href: `/comunidades/${slug}/calendario`, label: 'Calendario', icon: Calendar },
    { href: `/comunidades/${slug}/miembros-lista`, label: 'Miembros', icon: Users },
    { href: `/comunidades/${slug}/ranking`,    label: 'Ranking',    icon: Trophy },
    { href: `/comunidades/${slug}`,            label: 'Info',       icon: Info },
  ]

  const isActive = (href: string) => {
    if (href === `/comunidades/${slug}`) return pathname === `/comunidades/${slug}`
    return pathname.startsWith(href)
  }

  return (
    <div style={{ minHeight: '100vh', background: bgColor, overflowX: 'hidden' }}>
      {/* Community top bar */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Logo */}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: community.logo_url ? undefined : accent + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden', flexShrink: 0, border: `2px solid ${accent}40` }}>
            {community.logo_url
              ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '🌐'}
          </div>

          {/* Name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 15, color: '#E8E9F0', letterSpacing: '-0.02em' }}>
                {community.name}
              </span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,214,143,0.12)', color: '#00D68F', fontWeight: 700, border: '1px solid rgba(0,214,143,0.2)' }}>
                ● Activa
              </span>
            </div>
            {community.tagline && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.3 }}>{community.tagline}</p>
            )}
          </div>

          {/* Members count */}
          <div className="community-header-stats" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#E8E9F0' }}>{community.member_count ?? 0}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>miembros</div>
            </div>
            {isOwner && (
              <Link href="/creator/comunidad" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: `${accent}20`, border: `1px solid ${accent}40`, color: accent, textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap' }}>
                <Settings size={13} /> Configurar
              </Link>
            )}
          </div>
        </div>

        {/* Tabs row */}
        <div className="community-tabs" style={{ display: 'flex', padding: '0 16px', overflowX: 'auto', gap: 2 }}>
          {TABS.map(tab => {
            const active = isActive(tab.href)
            return (
              <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  fontFamily: active ? 'Syne, sans-serif' : 'Plus Jakarta Sans, sans-serif',
                  color: active ? '#E8E9F0' : 'rgba(255,255,255,0.4)',
                  borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  <tab.icon size={14} />
                  {tab.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
