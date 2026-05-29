'use client'

import Link from 'next/link'
import { Users, TrendingUp, FileText, Eye, DollarSign, Activity, ArrowUpRight } from 'lucide-react'

interface Props {
  community: any
  analytics: any
  monthlyRevenue: number
  recentMembers: any[]
}

function MiniChart({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sin datos aún</span>
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.count), 1)
  const width = 300
  const height = 60
  const padding = 4

  // Build sparkline points
  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((d.count / max) * (height - padding * 2))
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AnalyticsClient({ community, analytics, monthlyRevenue, recentMembers }: Props) {
  const accent = community.primary_color ?? '#6C47FF'
  const growthData: { date: string; count: number }[] = analytics.member_growth ?? []
  const topPosts: any[] = analytics.top_posts ?? []

  const STATS = [
    {
      label: 'Miembros totales',
      value: (analytics.total_members ?? 0).toLocaleString(),
      sub: `+${analytics.new_this_week ?? 0} esta semana`,
      icon: Users,
      color: '#6C47FF',
      bg: 'rgba(108,71,255,0.08)',
      trend: (analytics.new_this_week ?? 0) > 0,
    },
    {
      label: 'Nuevos este mes',
      value: (analytics.new_this_month ?? 0).toLocaleString(),
      sub: `${analytics.active_members ?? 0} activos (7 días)`,
      icon: TrendingUp,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.08)',
      trend: (analytics.new_this_month ?? 0) > 0,
    },
    {
      label: 'Posts publicados',
      value: (analytics.total_posts ?? 0).toLocaleString(),
      sub: `+${analytics.posts_this_week ?? 0} esta semana`,
      icon: FileText,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.08)',
      trend: (analytics.posts_this_week ?? 0) > 0,
    },
    {
      label: 'Ingresos mensuales',
      value: `$${monthlyRevenue.toFixed(2)}`,
      sub: 'Membresías activas',
      icon: DollarSign,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
      trend: monthlyRevenue > 0,
    },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,32px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Analytics</p>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(20px,4vw,28px)', letterSpacing: '-0.03em', marginBottom: 4 }}>
            {community.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Últimos 30 días · Actualizado en tiempo real</p>
        </div>
        <Link href={`/comunidades/${community.slug}`} target="_blank"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border2)', background: 'var(--bg1)', color: 'var(--muted2)', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>
          <ArrowUpRight size={13} /> Ver comunidad
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 18px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={17} color={s.color} />
              </div>
              {s.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: 99 }}>
                  ↑ Activo
                </div>
              )}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 26, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 3 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 3, fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              📈 Crecimiento de miembros
            </h2>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Nuevos miembros por día — últimos 30 días</p>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 22, color: accent }}>
            +{analytics.new_this_month ?? 0}
          </div>
        </div>
        <MiniChart data={growthData} color={accent} />
        {growthData.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {new Date(growthData[0]?.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Hoy</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Recent members */}
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>👥 Últimos miembros</h2>
          </div>
          {recentMembers.length === 0 ? (
            <div style={{ padding: '30px 18px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>Sin miembros aún</div>
          ) : (
            <div>
              {recentMembers.map((m: any) => {
                const profile = m.profile as any
                const initials = (profile?.display_name ?? 'U').slice(0, 2).toUpperCase()
                return (
                  <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: accent, overflow: 'hidden', flexShrink: 0 }}>
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.display_name ?? 'Usuario'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {m.joined_at ? new Date(m.joined_at).toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                    </div>
                    {m.role === 'owner' && (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: accent + '15', color: accent, fontWeight: 600 }}>Owner</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top posts */}
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>🔥 Posts más populares</h2>
          </div>
          {topPosts.length === 0 ? (
            <div style={{ padding: '30px 18px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>Sin posts aún</div>
          ) : (
            <div>
              {topPosts.map((p: any, i: number) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: i === 0 ? '#F59E0B' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: i === 0 ? '#fff' : 'var(--muted)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title || (p.content ?? '').replace(/<[^>]*>/g, '').slice(0, 50)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      ❤️ {p.likes ?? 0} · 💬 {p.comments_count ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { href: '/creator/comunidad', label: 'Editar comunidad', emoji: '⚙️' },
          { href: '/creator/cursos/nuevo', label: 'Crear curso', emoji: '📚' },
          { href: '/creator/miembros', label: 'Ver miembros', emoji: '👥' },
          { href: '/creator/ingresos', label: 'Ver ingresos', emoji: '💰' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, background: 'var(--bg1)', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 500, transition: 'all .12s' }}>
            <span style={{ fontSize: 18 }}>{a.emoji}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
