import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, BookOpen, MessageSquare, TrendingUp, Calendar, Megaphone, Settings, BarChart2, ArrowUpRight, Star } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

export default async function CreatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!community) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, color: C.text, marginBottom: 12 }}>Crea tu comunidad</h1>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>Empieza a construir tu audiencia en EscalaClub.</p>
        <Link href="/creator/comunidad" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15 }}>
          Crear mi comunidad →
        </Link>
      </div>
    )
  }

  const [
    { count: totalMembers },
    { count: totalPosts },
    { count: totalCourses },
    { data: recentMembers },
    { data: recentPosts },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabase.from('ec_community_members').select('*', { count: 'exact', head: true }).eq('community_id', community.id).eq('status', 'active'),
    supabase.from('ec_posts').select('*', { count: 'exact', head: true }).eq('community_id', community.id),
    supabase.from('ec_courses').select('*', { count: 'exact', head: true }).eq('community_id', community.id).eq('is_published', true),
    supabase.from('ec_community_members').select('*, profile:ec_profiles(display_name, avatar_url)').eq('community_id', community.id).eq('status', 'active').order('joined_at', { ascending: false }).limit(5),
    supabase.from('ec_posts').select('id, content, created_at, is_announcement').eq('community_id', community.id).order('created_at', { ascending: false }).limit(4),
    supabase.from('ec_events').select('id, title, starts_at, rsvp_count').eq('community_id', community.id).gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
  ])

  const accent = community.primary_color ?? '#7C3AED'

  const stats = [
    { label: 'Miembros activos', value: totalMembers ?? 0, icon: Users, color: accent, bg: accent + '15', delta: '+' + (recentMembers?.length ?? 0) + ' recientes' },
    { label: 'Posts publicados', value: totalPosts ?? 0, icon: MessageSquare, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', delta: 'en el foro' },
    { label: 'Cursos activos', value: totalCourses ?? 0, icon: BookOpen, color: C.gold, bg: 'rgba(240,165,0,0.1)', delta: 'publicados' },
    { label: 'Eventos próximos', value: upcomingEvents?.length ?? 0, icon: Calendar, color: C.green, bg: 'rgba(0,214,143,0.1)', delta: 'programados' },
  ]

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: community.logo_url ? undefined : accent + '22', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${accent}33` }}>
            {community.logo_url ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em', color: C.text, marginBottom: 3 }}>{community.name}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 10px', borderRadius: 99, background: 'rgba(0,214,143,0.12)', color: C.green, fontSize: 11, fontWeight: 700 }}>● Activa</span>
              <span style={{ fontSize: 12, color: C.muted }}>escalaclub.com/comunidades/{community.slug}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/creator/anuncios" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.3)', color: C.gold, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            <Megaphone size={14} /> Anuncio
          </Link>
          <Link href="/creator/comunidad" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 13 }}>
            <Settings size={14} /> Configurar
          </Link>
          <Link href={`/comunidades/${community.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#fff', textDecoration: 'none', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Ver comunidad <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
              <span style={{ fontSize: 11, color: C.muted }}>{s.delta}</span>
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.04em', color: s.color, lineHeight: 1 }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 18, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Quick actions */}
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 14 }}>Acciones rápidas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Nuevo anuncio', icon: '📢', href: '/creator/anuncios', color: C.gold },
                { label: 'Nuevo curso', icon: '📚', href: '/creator/cursos/nuevo', color: C.purple2 },
                { label: 'Nuevo evento', icon: '📅', href: '/eventos', color: C.green },
                { label: 'Ver foro', icon: '💬', href: `/comunidades/${community.slug}/foro`, color: '#3B82F6' },
                { label: 'Gestionar miembros', icon: '👥', href: '/creator/miembros', color: C.muted2 },
                { label: 'Chat comunidad', icon: '💭', href: `/comunidades/${community.slug}/chat`, color: '#EC4899' },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 14, background: C.bg2, border: `1px solid ${C.border}`, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: a.color, textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent posts */}
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>Actividad reciente</h2>
              <Link href={`/comunidades/${community.slug}/foro`} style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Ver todo →</Link>
            </div>
            {recentPosts && recentPosts.length > 0 ? recentPosts.map((post, i) => (
              <div key={post.id} style={{ padding: '12px 20px', borderBottom: i < recentPosts.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {post.is_announcement && <span style={{ fontSize: 14, flexShrink: 0 }}>📢</span>}
                <p style={{ fontSize: 13, color: C.muted2, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content}</p>
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{new Date(post.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', color: C.muted, fontSize: 13 }}>Sin posts aún</div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent members */}
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: C.text }}>Miembros recientes</h3>
              <Link href="/creator/miembros" style={{ fontSize: 11, color: C.muted, textDecoration: 'none' }}>Ver todos →</Link>
            </div>
            {recentMembers && recentMembers.length > 0 ? recentMembers.map((m: any, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: i < recentMembers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 12, color: accent, flexShrink: 0, overflow: 'hidden' }}>
                  {(m.profile as any)?.avatar_url ? <img src={(m.profile as any).avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ((m.profile as any)?.display_name?.[0]?.toUpperCase() ?? '?')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(m.profile as any)?.display_name ?? 'Usuario'}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{m.points ?? 0} pts · {m.role}</div>
                </div>
              </div>
            )) : <div style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: 13 }}>Sin miembros aún</div>}
          </div>

          {/* Upcoming events */}
          {upcomingEvents && upcomingEvents.length > 0 && (
            <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: C.text }}>Próximos eventos</h3>
              </div>
              {upcomingEvents.map((ev, i) => (
                <div key={ev.id} style={{ padding: '12px 18px', borderBottom: i < upcomingEvents.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{new Date(ev.starts_at).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {ev.rsvp_count} RSVPs</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
