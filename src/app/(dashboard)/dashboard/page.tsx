import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Zap, Play, Calendar, Trophy, Flame } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: myMemberships },
    { data: events },
    { data: topMembers },
    { data: recentChallenges },
    { data: myParticipations },
  ] = await Promise.all([
    supabase.from('ec_profiles').select('*').eq('id', user.id).single(),
    supabase.from('ec_community_members')
      .select('community_id, role, points, level, community:ec_communities(id,name,slug,logo_url,primary_color,member_count,access_type)')
      .eq('user_id', user.id).eq('status', 'active').limit(6),
    supabase.from('ec_events')
      .select('id,title,starts_at,meet_url')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at').limit(3),
    supabase.from('ec_community_members')
      .select('user_id, points, profile:ec_profiles(display_name,avatar_url)')
      .order('points', { ascending: false }).limit(5),
    supabase.from('ec_challenges')
      .select('id,title,emoji,status,participant_count,duration_days,origin')
      .in('status', ['active','upcoming']).limit(3),
    supabase.from('ec_challenge_participants')
      .select('challenge_id, current_streak, days_completed')
      .eq('user_id', user.id).eq('status', 'active'),
  ])

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = profile?.display_name?.split(' ')[0] ?? 'ahí'
  const totalPoints = myMemberships?.reduce((s, m) => s + ((m as any).points ?? 0), 0) ?? 0
  const maxStreak = myParticipations?.reduce((m, p) => Math.max(m, p.current_streak ?? 0), 0) ?? 0
  const hasActivity = (myMemberships?.length ?? 0) > 0

  return (
    <div style={{ padding: '40px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── HERO HEADER — sin card, tipografía domina ── */}
      <div style={{ marginBottom: 52 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{greeting}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {firstName} <span className="text-gradient">👋</span>
          </h1>
          {/* Stats como números flotantes — sin cards */}
          {hasActivity && (
            <div style={{ display: 'flex', gap: 36, alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>{totalPoints.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>puntos totales</div>
              </div>
              {maxStreak > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--green)', lineHeight: 1 }}>🔥 {maxStreak}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>días de racha</div>
                </div>
              )}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--purple2)', lineHeight: 1 }}>{myMemberships?.length ?? 0}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>comunidades</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RETOS ACTIVOS — el highlight si hay ── */}
      {(recentChallenges?.length ?? 0) > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color="var(--gold)" />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>Retos activos</span>
            </div>
            <Link href="/retos" style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {recentChallenges?.map((c: any) => {
              const myP = myParticipations?.find(p => p.challenge_id === c.id)
              const pct = myP ? Math.round((myP.days_completed / c.duration_days) * 100) : 0
              return (
                <Link key={c.id} href="/retos" style={{ textDecoration: 'none', flexShrink: 0, width: 220 }}>
                  <div style={{
                    background: c.origin === 'platform'
                      ? 'linear-gradient(135deg, rgba(233,160,32,0.08), rgba(233,160,32,0.03))'
                      : 'var(--bg1)',
                    border: `1px solid ${c.origin === 'platform' ? 'rgba(233,160,32,0.2)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-lg)',
                    padding: '16px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{c.emoji}</span>
                      {c.origin === 'platform' && <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--gold)', background: 'rgba(233,160,32,0.12)', borderRadius: 99, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Oficial</span>}
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 6, lineHeight: 1.2 }}>{c.title}</div>
                    {myP ? (
                      <>
                        <div className="progress-bar" style={{ marginBottom: 6 }}>
                          <div className={`progress-fill ${c.origin === 'platform' ? 'progress-fill-gold' : ''}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
                          <span>{pct}% completado</span>
                          <span style={{ color: 'var(--gold)' }}>🔥 {myP.current_streak}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.participant_count} participantes · {c.duration_days} días</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 24, alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Mis comunidades */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>Mis comunidades</span>
              <Link href="/comunidades" style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                Explorar <ArrowRight size={12} />
              </Link>
            </div>

            {myMemberships && myMemberships.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {myMemberships.map((m: any, i: number) => (
                  <Link key={i} href={`/comunidades/${m.community?.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                      borderRadius: 'var(--r-md)', transition: 'background 0.15s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: (m.community?.primary_color ?? '#7B5EF8') + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, overflow: 'hidden',
                        border: `1px solid ${(m.community?.primary_color ?? '#7B5EF8') + '30'}`,
                      }}>
                        {m.community?.logo_url
                          ? <img src={m.community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : '🌐'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.community?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{m.community?.member_count ?? 0} miembros</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {(m.points ?? 0) > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{(m.points ?? 0).toLocaleString()} pts</span>}
                        <ChevronRight size={14} color="var(--muted)" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🌐</div>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>
                  Aún no eres miembro de ninguna comunidad.<br />
                  <span style={{ color: 'var(--text2)' }}>Explora y únete a las mejores de LATAM.</span>
                </p>
                <Link href="/comunidades" className="btn-primary" style={{ fontSize: 13 }}>
                  Explorar comunidades <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Próximos eventos */}
          {events && events.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="var(--blue2)" />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>Próximos eventos</span>
                </div>
                <Link href="/eventos" style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Ver todos <ArrowRight size={12} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {events.map((e: any) => {
                  const d = new Date(e.starts_at)
                  const isToday = d.toDateString() === new Date().toDateString()
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--r-md)' }}>
                      <div style={{ width: 38, textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 16, color: isToday ? 'var(--red)' : 'var(--purple2)' }}>
                          {d.getDate()}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          {d.toLocaleString('es', { month: 'short' })}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                          {d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                          {isToday && <span style={{ marginLeft: 6, color: 'var(--red)', fontWeight: 700 }}>Hoy</span>}
                        </div>
                      </div>
                      {e.meet_url && (
                        <a href={e.meet_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--green)', textDecoration: 'none' }}>
                          <Play size={11} fill="currentColor" /> Unirse
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Leaderboard mini */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Trophy size={14} color="var(--gold)" />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>Top miembros</span>
          </div>
          {topMembers && topMembers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topMembers.map((m: any, i: number) => {
                const isMe = m.user_id === user.id
                const medals = ['🥇', '🥈', '🥉']
                const name = (m.profile as any)?.display_name ?? 'Usuario'
                const initials = name.slice(0, 2).toUpperCase()
                return (
                  <div key={m.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 'var(--r-md)',
                    background: isMe ? 'rgba(123,94,248,0.07)' : 'transparent',
                  }}>
                    <div style={{ width: 20, textAlign: 'center', fontSize: 14, flexShrink: 0 }}>
                      {i < 3 ? medals[i] : <span style={{ fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--muted)' }}>#{i+1}</span>}
                    </div>
                    <div className="avatar avatar-sm avatar-purple" style={{ background: isMe ? 'linear-gradient(135deg, var(--purple), var(--purple2))' : 'var(--bg3)' }}>
                      {(m.profile as any)?.avatar_url
                        ? <img src={(m.profile as any).avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isMe ? 'var(--purple2)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}{isMe ? ' (tú)' : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: i === 0 ? 'var(--gold)' : isMe ? 'var(--purple2)' : 'var(--muted2)' }}>
                      {(m.points ?? 0).toLocaleString()}
                    </div>
                  </div>
                )
              })}
              <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px', fontSize: 12, color: 'var(--muted)', textDecoration: 'none', marginTop: 4 }}>
                Ver ranking completo <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Sé el primero en el ranking 🏆
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
