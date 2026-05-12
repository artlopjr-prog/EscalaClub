import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, BookOpen, Globe, Trophy, Calendar, Play, ChevronRight, Zap } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: myMemberships },
    { data: events },
    { data: topMembers },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from('ec_profiles').select('*').eq('id', user.id).single(),
    supabase.from('ec_community_members')
      .select('community_id, role, points, level, community:ec_communities(id,name,slug,logo_url,primary_color,member_count,access_type)')
      .eq('user_id', user.id).eq('status', 'active').limit(5),
    supabase.from('ec_events')
      .select('id,title,starts_at,meet_url,community_id')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at').limit(3),
    supabase.from('ec_community_members')
      .select('user_id, points, level, profile:ec_profiles(display_name,avatar_url)')
      .order('points', { ascending: false }).limit(5),
    supabase.from('ec_posts')
      .select('id,content,created_at,author_id')
      .order('created_at', { ascending: false }).limit(4),
  ])

  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = profile?.display_name?.split(' ')[0] ?? 'Creador'
  const totalPoints = myMemberships?.reduce((s, m) => s + (m.points ?? 0), 0) ?? 0

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{greeting},</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            {firstName} 👋
          </h1>
        </div>
        {totalPoints > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--gold)' }}>
              {totalPoints.toLocaleString()} pts
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>puntos totales</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Comunidades', value: myMemberships?.length ?? 0, icon: Globe, color: 'var(--purple2)', bg: 'rgba(159,103,255,0.1)' },
          { label: 'Puntos', value: totalPoints.toLocaleString(), icon: Trophy, color: 'var(--gold)', bg: 'rgba(240,165,0,0.1)' },
          { label: 'Eventos próximos', value: events?.length ?? 0, icon: Calendar, color: 'var(--green)', bg: 'rgba(0,214,143,0.1)' },
          { label: 'Posts recientes', value: recentPosts?.length ?? 0, icon: BookOpen, color: '#FF7849', bg: 'rgba(255,120,73,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: '-0.04em', color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Mis comunidades */}
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em' }}>Mis comunidades</h2>
              <Link href="/comunidades" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                Explorar <ArrowRight size={12} />
              </Link>
            </div>
            {myMemberships && myMemberships.length > 0 ? (
              <div>
                {myMemberships.map((m: any) => (
                  <Link key={m.id} href={`/comunidades/${m.community?.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: (m.community?.primary_color ?? '#7C3AED') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, overflow: 'hidden' }}>
                        {m.community?.logo_url ? <img src={m.community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.community?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{m.community?.member_count ?? 0} miembros · {m.points ?? 0} pts</div>
                      </div>
                      <ChevronRight size={14} color="var(--muted)" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌐</div>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>Aún no eres miembro de ninguna comunidad</p>
                <Link href="/comunidades" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  Explorar comunidades <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Feed reciente */}
          {recentPosts && recentPosts.length > 0 && (
            <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em' }}>Actividad reciente</h2>
              </div>
              {recentPosts.map((post: any) => (
                <div key={post.id} style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 11, color: '#A78BFA', flexShrink: 0 }}>
                    {'?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{'Miembro'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Eventos */}
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '-0.03em' }}>Próximos eventos</h2>
            </div>
            {events && events.length > 0 ? (
              <div style={{ padding: '8px' }}>
                {events.map((ev: any) => (
                  <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '10px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}>
                    <div style={{ width: 4, borderRadius: 99, background: 'var(--grad-purple)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {new Date(ev.starts_at).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin eventos próximos</p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '-0.03em' }}>Leaderboard</h2>
              <Link href="/leaderboard" style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>Ver todo →</Link>
            </div>
            <div style={{ padding: '8px' }}>
              {topMembers?.map((m: any, i: number) => {
                const medals = ['🥇','🥈','🥉']
                const isMe = m.user_id === user.id
                return (
                  <div key={m.user_id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: isMe ? 'rgba(124,58,237,0.08)' : 'transparent', border: isMe ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent', marginBottom: 3 }}>
                    <div style={{ width: 18, textAlign: 'center', fontSize: i < 3 ? 14 : 10, color: 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>
                      {i < 3 ? medals[i] : `${i + 1}`}
                    </div>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 10, color: '#A78BFA', flexShrink: 0 }}>
                      {(m.profile as any)?.display_name?.[0] ?? '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(m.profile as any)?.display_name ?? 'Usuario'} {isMe && <span style={{ color: 'var(--purple2)', fontSize: 9 }}>• tú</span>}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: 'var(--gold)', flexShrink: 0 }}>
                      {(m.points ?? 0).toLocaleString()}
                    </div>
                  </div>
                )
              })}
              {(!topMembers || topMembers.length === 0) && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sé el primero en el ranking 🏆</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA crear comunidad */}
          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '20px' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>🚀</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, marginBottom: 6, letterSpacing: '-0.03em' }}>¿Listo para crear tu comunidad?</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>Monetiza tu conocimiento y construye tu audiencia en LATAM.</p>
            <Link href="/precios" className="btn-primary" style={{ padding: '9px 16px', fontSize: 12, display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              Ver planes <Zap size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
