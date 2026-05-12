import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, BookOpen, Calendar, MessageSquare, Lock, Radio, HelpCircle, MessageCircle, Settings, ArrowLeft } from 'lucide-react'
import JoinButton from './JoinButton'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

export default async function ComunidadPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!community) notFound()

  const { data: ownerProfile } = await supabase
    .from('ec_profiles')
    .select('display_name, avatar_url')
    .eq('id', community.owner_id)
    .maybeSingle()

  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('id, role, points')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isMember = !!membership
  const isOwner = community.owner_id === user.id
  const hasAccess = isMember || isOwner

  const { data: courses } = await supabase
    .from('ec_courses')
    .select('id, title, cover_url')
    .eq('community_id', community.id)
    .eq('is_published', true)
    .limit(6)

  const { data: events } = await supabase
    .from('ec_events')
    .select('id, title, starts_at, rsvp_count')
    .eq('community_id', community.id)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(3)

  const { data: recentPosts } = await supabase
    .from('ec_posts')
    .select('id, content, created_at, author:ec_profiles(display_name)')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const accentColor = community.primary_color ?? '#7C3AED'

  // Community content sections available to members
  const SECTIONS = [
    { href: `/comunidades/${slug}/foro`, icon: MessageSquare, label: 'Foro', desc: 'Posts y discusiones', color: accentColor, emoji: '💬' },
    { href: `/comunidades/${slug}/chat`, icon: MessageCircle, label: 'Chat', desc: 'Mensajes en tiempo real', color: '#3B82F6', emoji: '💭' },
    { href: `/comunidades/${slug}/live`, icon: Radio, label: 'Lives', desc: 'Sesiones en vivo', color: C.red, emoji: '🔴' },
    { href: `/comunidades/${slug}/qa`, icon: HelpCircle, label: 'Q&A', desc: 'Preguntas y respuestas', color: C.gold, emoji: '❓' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Banner */}
      <div style={{ height: 180, background: community.banner_url ? undefined : `linear-gradient(135deg, ${accentColor}44, ${accentColor}11)`, position: 'relative', overflow: 'hidden' }}>
        {community.banner_url && <img src={community.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(6,6,10,0.95) 100%)' }} />
        <Link href="/comunidades" style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', textDecoration: 'none', fontSize: 12 }}>
          <ArrowLeft size={13} /> Comunidades
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -50, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ width: 84, height: 84, borderRadius: 20, border: '4px solid #06060A', background: community.logo_url ? undefined : accentColor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, overflow: 'hidden', flexShrink: 0, zIndex: 1 }}>
            {community.logo_url ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: C.text }}>{community.name}</h1>
              {community.access_type === 'public'
                ? <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(0,214,143,0.12)', color: C.green, fontSize: 11, fontWeight: 700 }}>Gratuita</span>
                : <span style={{ padding: '3px 10px', borderRadius: 99, background: accentColor + '22', color: accentColor, fontSize: 11, fontWeight: 700 }}>💎 ${community.price_monthly}/mes</span>
              }
            </div>
            {community.tagline && <p style={{ fontSize: 14, color: C.muted2, marginTop: 4 }}>{community.tagline}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.muted }}><Users size={13} /> {(community.member_count ?? 0).toLocaleString()} miembros</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.muted }}><BookOpen size={13} /> {courses?.length ?? 0} cursos</span>
              {community.category && <span style={{ padding: '2px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: C.muted, fontSize: 11 }}>{community.category}</span>}
            </div>
          </div>
          <div style={{ paddingBottom: 4, zIndex: 1 }}>
            {isOwner ? (
              <Link href="/creator/comunidad" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', color: C.text, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, border: `1px solid ${C.border}` }}>
                <Settings size={15} /> Gestionar comunidad
              </Link>
            ) : (
              <JoinButton communityId={community.id} communityName={community.name} accessType={community.access_type} priceMonthly={community.price_monthly} isMember={isMember} accentColor={accentColor} userId={user.id} />
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Description */}
            {community.description && (
              <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 22 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 12 }}>Acerca de esta comunidad</h2>
                <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{community.description}</p>
              </div>
            )}

            {/* Content sections — only for members */}
            {hasAccess ? (
              <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>Espacios de la comunidad</h2>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Selecciona dónde quieres participar</p>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SECTIONS.map(s => (
                    <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 13, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {s.emoji}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{s.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: `linear-gradient(135deg, ${accentColor}11, rgba(0,0,0,0))`, border: `1px solid ${accentColor}33`, borderRadius: 20, padding: 32, textAlign: 'center' }}>
                <Lock size={36} color={accentColor} style={{ marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Contenido exclusivo para miembros</h3>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Únete para acceder al foro, chat, lives, Q&A, cursos y todos los eventos de esta comunidad.</p>
              </div>
            )}

            {/* Courses preview */}
            {courses && courses.length > 0 && (
              <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>Cursos incluidos</h2>
                  {hasAccess && <Link href="/cursos" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Ver todos →</Link>}
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {courses.map(course => (
                    <Link key={course.id} href={hasAccess ? `/cursos/${course.id}` : '#'} style={{ textDecoration: 'none' }}>
                      <div style={{ background: C.bg2, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ height: 90, background: course.cover_url ? undefined : `linear-gradient(135deg, ${accentColor}22, rgba(0,0,0,0.3))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                          {course.cover_url ? <img src={course.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📚'}
                        </div>
                        {!hasAccess && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} color="rgba(255,255,255,0.6)" /></div>}
                        <div style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity */}
            {hasAccess && recentPosts && recentPosts.length > 0 && (
              <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>Actividad reciente</h2>
                  <Link href={`/comunidades/${slug}/foro`} style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Ver foro →</Link>
                </div>
                {recentPosts.map((post: any, i) => (
                  <div key={post.id} style={{ padding: '14px 22px', borderBottom: i < recentPosts.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: accentColor, flexShrink: 0 }}>
                      {(post.author as any)?.display_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{(post.author as any)?.display_name}</div>
                      <div style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Creator */}
            <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Creador</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: accentColor, flexShrink: 0, overflow: 'hidden' }}>
                  {ownerProfile?.avatar_url ? <img src={ownerProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ownerProfile?.display_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ownerProfile?.display_name ?? 'Creador'}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Fundador de la comunidad</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Estadísticas</h3>
              {[
                { label: 'Miembros', value: (community.member_count ?? 0).toLocaleString(), icon: Users },
                { label: 'Cursos', value: courses?.length ?? 0, icon: BookOpen },
                { label: 'Eventos próximos', value: events?.length ?? 0, icon: Calendar },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted2 }}>
                    <s.icon size={14} color={C.muted} /> {s.label}
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Upcoming events */}
            {events && events.length > 0 && (
              <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: C.text }}>Próximos eventos</h3>
                </div>
                {events.map((ev, i) => (
                  <div key={ev.id} style={{ padding: '12px 18px', borderBottom: i < events.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{new Date(ev.starts_at).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {ev.rsvp_count} RSVPs</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
