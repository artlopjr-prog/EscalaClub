import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, BookOpen, Calendar, MessageSquare, Lock, Radio, HelpCircle, MessageCircle, Settings, ArrowLeft } from 'lucide-react'
import JoinButton from './JoinButton'
import LeaveButton from './LeaveButton'
import RejoinButton from './RejoinButton'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

export default async function ComunidadPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // No redirect — página pública. user puede ser null (visitante sin cuenta)

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
    .select('id, role, points, status, access_until, rejoin_requested_at, ban_reason')
    .eq('community_id', community.id)
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  const isBanned = membership?.status === 'banned'
  const isMember = !!membership && membership.status === 'active'
  const isOwner = !!user && community.owner_id === user.id
  const hasAccess = !!user && (isMember || isOwner)
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
    .select('id, content, created_at, is_public, author:ec_profiles(display_name)')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })
    .limit(hasAccess ? 3 : 10)

  const accentColor = community.primary_color ?? '#7C3AED'

  const SECTIONS = [
    { href: `/comunidades/${slug}/foro`, icon: MessageSquare, label: 'Foro', desc: 'Posts y discusiones', color: accentColor, emoji: '💬' },
    { href: `/comunidades/${slug}/chat`, icon: MessageCircle, label: 'Chat', desc: 'Mensajes en tiempo real', color: '#3B82F6', emoji: '💭' },
    { href: `/comunidades/${slug}/live`, icon: Radio, label: 'Lives', desc: 'Sesiones en vivo', color: C.red, emoji: '🔴' },
    { href: `/comunidades/${slug}/qa`, icon: HelpCircle, label: 'Q&A', desc: 'Preguntas y respuestas', color: C.gold, emoji: '❓' },
  ]

  // Recent members for avatar stack
  const { data: recentMembers } = await supabase
    .from('ec_community_members')
    .select('user_id, profile:ec_profiles(display_name, avatar_url)')
    .eq('community_id', community.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  const isFree = !community.price_monthly || community.price_monthly === 0
  // Detect video provider and extract embed URL
  let videoEmbedUrl: string | null = null
  if (community.intro_video_url) {
    const url = community.intro_video_url
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0]
      videoEmbedUrl = `https://www.youtube.com/embed/${id}`
    } else if (url.includes('youtube.com')) {
      const id = url.split('v=')[1]?.split('&')[0]
      videoEmbedUrl = `https://www.youtube.com/embed/${id}`
    } else if (url.includes('vimeo.com')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0]
      videoEmbedUrl = `https://player.vimeo.com/video/${id}`
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* BANNER GRANDE */}
      <div style={{ height: 240, background: community.banner_url ? undefined : `linear-gradient(135deg,${accentColor}44,${accentColor}11)`, position: 'relative', overflow: 'hidden' }}>
        {community.banner_url && <img src={community.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 20%,rgba(6,6,10,0.97) 100%)' }} />
        <Link href="/comunidades" style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', textDecoration: 'none', fontSize: 12 }}>
          <ArrowLeft size={13} /> Comunidades
        </Link>
        {isOwner && (
          <Link href="/creator/comunidad" style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', textDecoration: 'none', fontSize: 12 }}>
            <Settings size={13} /> Editar
          </Link>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>

        {/* LAYOUT: Left content + Right sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start', marginTop: -60, position: 'relative', zIndex: 10 }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Header info */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, border: '4px solid var(--bg)', background: community.logo_url ? undefined : accentColor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {community.logo_url ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
              </div>
              <div style={{ paddingBottom: 4, flex: 1 }}>
                <h1 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 'clamp(20px,4vw,30px)', letterSpacing: '-.04em', marginBottom: 4 }}>{community.name}</h1>
                {community.tagline && <p style={{ fontSize: 14, color: 'var(--muted2)' }}>{community.tagline}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={13} /> {(community.member_count ?? 0).toLocaleString()} miembros
                  </span>
                  {isFree
                    ? <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', background: 'rgba(0,214,143,0.1)', borderRadius: 99, padding: '2px 10px' }}>Gratis</span>
                    : <span style={{ fontSize: 12, fontWeight: 700, color: accentColor, background: accentColor + '15', borderRadius: 99, padding: '2px 10px' }}>💎 ${community.price_monthly}/mes</span>
                  }
                  {community.category && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>{community.category}</span>}
                </div>
              </div>
            </div>

            {/* VIDEO de presentación */}
            {videoEmbedUrl && (
              <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={videoEmbedUrl!}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* DESCRIPCIÓN */}
            {community.description && (
              <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: 22 }}>
                <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Acerca de esta comunidad</h2>
                <p style={{ fontSize: 14, color: 'var(--muted2)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{community.description}</p>
              </div>
            )}

            {/* CONTENIDO PARA MIEMBROS */}
            {hasAccess ? (
              <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 15 }}>Espacios de la comunidad</h2>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
                  {SECTIONS.map(s => (
                    <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
                        <div>
                          <div style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 13, marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : isBanned ? (
              <div style={{ background: 'rgba(255,77,106,0.06)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🚫</div>
                <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 18, color: '#FF4D6A', marginBottom: 8 }}>Acceso restringido</h3>
                <p style={{ fontSize: 14, color: 'var(--muted2)' }}>Fuiste removido de esta comunidad.</p>
              </div>
            ) : (
              <div style={{ background: `linear-gradient(135deg,${accentColor}12,rgba(0,0,0,0))`, border: `1px solid ${accentColor}33`, borderRadius: 20, padding: 32, textAlign: 'center' }}>
                <Lock size={36} color={accentColor} style={{ marginBottom: 14 }} />
                <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Contenido exclusivo para miembros</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>Únete para acceder al foro, cursos, eventos y todo el contenido exclusivo.</p>
              </div>
            )}

            {/* CURSOS */}
            {courses && courses.length > 0 && (
              <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 15 }}>Cursos incluidos</h2>
                  {hasAccess && <Link href="/cursos" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>Ver todos →</Link>}
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
                  {courses.map(course => (
                    <Link key={course.id} href={hasAccess ? `/cursos/${course.id}` : '#'} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'var(--bg2)', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ height: 90, background: course.cover_url ? undefined : `linear-gradient(135deg,${accentColor}22,rgba(0,0,0,0.3))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                          {course.cover_url ? <img src={course.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📚'}
                        </div>
                        {!hasAccess && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} color="rgba(255,255,255,0.6)" /></div>}
                        <div style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 20 }}>

            {/* JOIN CARD — lo más prominente */}
            <div style={{ background: 'var(--bg1)', border: `1px solid ${accentColor}33`, borderRadius: 20, padding: 20, boxShadow: `0 8px 32px ${accentColor}15` }}>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 20 }}>{(community.member_count ?? 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Miembros</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 20 }}>{courses?.length ?? 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Cursos</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 20 }}>{events?.length ?? 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Eventos</div>
                </div>
              </div>

              {/* Avatar stack de miembros */}
              {recentMembers && recentMembers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ display: 'flex' }}>
                    {recentMembers.slice(0, 6).map((m: any, i: number) => {
                      const name = (m.profile as any)?.display_name ?? 'U'
                      const avatar = (m.profile as any)?.avatar_url
                      return (
                        <div key={m.user_id} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--bg1)', marginLeft: i === 0 ? 0 : -8, background: avatar ? undefined : `linear-gradient(135deg,${accentColor},${accentColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', overflow: 'hidden', zIndex: 10 - i }}>
                          {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name.slice(0, 2).toUpperCase()}
                        </div>
                      )
                    })}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>y {Math.max(0, (community.member_count ?? 0) - 6).toLocaleString()} más</span>
                </div>
              )}

              {/* Precio */}
              {!isFree && !hasAccess && (
                <div style={{ marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 26, color: accentColor }}>${community.price_monthly}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>/mes</span></div>
                  {community.price_yearly && <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 2 }}>o ${community.price_yearly}/año · Ahorra ${Math.round((community.price_monthly ?? 0) * 12 - community.price_yearly)}</div>}
                </div>
              )}

              {/* BOTÓN PRINCIPAL */}
              <div style={{ width: '100%' }}>
                {!user ? (
                  // Visitante sin cuenta — redirigir a registro
                  <Link href={`/registro?redirect=/comunidades/${slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 20px', borderRadius: 12, background: `linear-gradient(135deg,${accentColor},${accentColor}cc)`, color: '#fff', textDecoration: 'none', fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 15, boxSizing: 'border-box', boxShadow: `0 4px 20px ${accentColor}44` }}>
                    {isFree ? '🚀 Únete gratis' : `Unirse · $${community.price_monthly}/mes`}
                  </Link>
                ) : isOwner ? (
                  <Link href="/creator/comunidad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', color: 'var(--text)', textDecoration: 'none', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 14, border: '1px solid var(--border)', boxSizing: 'border-box' }}>
                    <Settings size={15} /> Gestionar comunidad
                  </Link>
                ) : isBanned ? (
                  <RejoinButton membershipId={membership!.id} communityName={community.name} alreadyRequested={!!membership?.rejoin_requested_at} />
                ) : isMember ? (
                  <div>
                    <Link href={`/comunidades/${slug}/foro`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 20px', borderRadius: 12, background: `linear-gradient(135deg,${accentColor},${accentColor}cc)`, color: '#fff', textDecoration: 'none', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 14, boxSizing: 'border-box', marginBottom: 8 }}>
                      💬 Ir al foro
                    </Link>
                    <LeaveButton communityId={community.id} communityName={community.name} membershipId={membership!.id} userId={user.id!} isPaid={(community.access_type === 'paid')} accessUntil={membership?.access_until ?? null} />
                  </div>
                ) : (
                  <JoinButton
                    communityId={community.id}
                    communityName={community.name}
                    communitySlug={slug}
                    accessType={community.access_type}
                    priceMonthly={community.price_monthly ?? 0}
                    paypalEmail={community.paypal_account_email ?? null}
                    isMember={false}
                    accentColor={accentColor}
                    userId={user.id!}
                  />
                )}
              </div>

              {(!isMember && !isOwner) && (
                <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
                  {!user
                    ? 'Crea tu cuenta gratis en EscalaClub'
                    : isFree ? '✓ Gratis · Sin tarjeta de crédito' : '✓ Cancela cuando quieras · Pagos seguros vía PayPal'}
                </p>
              )}
            </div>

            {/* CREADOR */}
            <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Creado por</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 16, color: accentColor, overflow: 'hidden', flexShrink: 0 }}>
                  {ownerProfile?.avatar_url ? <img src={ownerProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ownerProfile?.display_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{ownerProfile?.display_name ?? 'Creador'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Fundador</div>
                </div>
              </div>

              {/* Redes sociales */}
              {(community.social_instagram || community.social_tiktok || community.social_youtube || community.social_twitter || community.social_website) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {community.social_instagram && <a href={community.social_instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, textDecoration: 'none' }}>📸</a>}
                  {community.social_tiktok && <a href={community.social_tiktok} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, textDecoration: 'none' }}>🎵</a>}
                  {community.social_youtube && <a href={community.social_youtube} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, textDecoration: 'none' }}>▶️</a>}
                  {community.social_twitter && <a href={community.social_twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, textDecoration: 'none' }}>🐦</a>}
                  {community.social_website && <a href={community.social_website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, textDecoration: 'none' }}>🌐</a>}
                </div>
              )}
            </div>

            {/* EVENTOS */}
            {events && events.length > 0 && (
              <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 13 }}>Próximos eventos</div>
                {events.map((ev, i) => (
                  <div key={ev.id} style={{ padding: '12px 16px', borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(ev.starts_at).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
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
