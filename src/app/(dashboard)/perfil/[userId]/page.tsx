import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Zap, Star, Calendar, Users } from 'lucide-react'

export default async function PerfilPublicoPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('*')
    .eq('id', params.userId)
    .single()

  if (!profile) notFound()

  const [
    { data: badges },
    { data: memberships },
    { data: challenges },
  ] = await Promise.all([
    supabase.from('ec_user_badges')
      .select('created_at, badge:ec_badges(name, emoji, color, rarity)')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('ec_community_members')
      .select('community:ec_communities(name, slug, logo_url, primary_color)')
      .eq('user_id', params.userId)
      .eq('status', 'active')
      .limit(6),
    supabase.from('ec_challenge_participants')
      .select('status, challenge:ec_challenges(title, emoji)')
      .eq('user_id', params.userId)
      .eq('status', 'completed')
      .limit(4),
  ])

  const initials = (profile.display_name ?? 'U').slice(0, 2).toUpperCase()
  const joinDate = new Date(profile.created_at).toLocaleDateString('es', { month: 'long', year: 'numeric' })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,28px)' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: profile.avatar_url ? undefined : 'linear-gradient(135deg, var(--purple), var(--purple2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 4 }}>
            {profile.display_name ?? 'Usuario'}
          </h1>
          {profile.bio && <p style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 10, lineHeight: 1.6 }}>{profile.bio}</p>}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--muted)' }}>
              <Calendar size={13} /> Miembro desde {joinDate}
            </div>
            {profile.country && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--muted)' }}>
                🌎 {profile.country}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { icon: <Zap size={18} color="var(--gold)" />, val: (profile.xp ?? 0).toLocaleString(), label: 'XP total' },
          { icon: <Trophy size={18} color="var(--purple)" />, val: `Nivel ${profile.level ?? 1}`, label: 'Nivel actual' },
          { icon: <Star size={18} color="var(--green)" />, val: badges?.length ?? 0, label: 'Badges' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* BADGES */}
      {badges && badges.length > 0 && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🎖 Badges obtenidos</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {badges.map((b: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: `${(b.badge as any)?.color ?? '#7C3AED'}15`, border: `1px solid ${(b.badge as any)?.color ?? '#7C3AED'}30` }}>
                <span style={{ fontSize: 16 }}>{(b.badge as any)?.emoji ?? '🏅'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: (b.badge as any)?.color ?? 'var(--purple)' }}>{(b.badge as any)?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMUNIDADES */}
      {memberships && memberships.length > 0 && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🌐 Comunidades</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memberships.map((m: any, i: number) => {
              const c = m.community as any
              return (
                <Link key={i} href={`/comunidades/${c?.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, textDecoration: 'none', transition: 'background .12s' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: c?.logo_url ? undefined : (c?.primary_color ?? 'var(--purple)') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {c?.logo_url ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{c?.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* RETOS COMPLETADOS */}
      {challenges && challenges.length > 0 && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>⚡ Retos completados</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {challenges.map((ch: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: 'rgba(0,207,136,0.08)', border: '1px solid rgba(0,207,136,0.2)' }}>
                <span style={{ fontSize: 14 }}>{(ch.challenge as any)?.emoji ?? '⚡'}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)' }}>{(ch.challenge as any)?.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
