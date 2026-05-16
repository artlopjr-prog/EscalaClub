import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Globe, BookOpen, DollarSign, TrendingUp, ShieldCheck, Activity } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('ec_profiles').select('role_platform').eq('id', user.id).single()
  if (profile?.role_platform !== 'super_admin') redirect('/dashboard')

  const [
    { count: totalUsers },
    { count: totalCommunities },
    { count: totalCourses },
    { data: recentUsers },
    { data: recentCommunities },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.from('ec_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('ec_communities').select('*', { count: 'exact', head: true }),
    supabase.from('ec_courses').select('*', { count: 'exact', head: true }),
    supabase.from('ec_profiles').select('id, display_name, role_platform, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('ec_communities').select('id, name, slug, member_count, access_type, price_monthly, status, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('ec_creator_subscriptions').select('id, plan, status, amount, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const mrr = subscriptions?.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount ?? 0), 0) ?? 0

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={20} color={C.purple2} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: C.text, marginBottom: 2 }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: C.muted }}>Vista general de EscalaClub</p>
        </div>
        <div style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', color: C.purple2, fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
          SUPER ADMIN
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Usuarios totales', value: totalUsers ?? 0, icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Comunidades', value: totalCommunities ?? 0, icon: Globe, color: C.purple2, bg: 'rgba(124,58,237,0.1)' },
          { label: 'Cursos', value: totalCourses ?? 0, icon: BookOpen, color: C.gold, bg: 'rgba(240,165,0,0.1)' },
          { label: 'MRR Plataforma', value: `$${mrr.toFixed(0)}`, icon: DollarSign, color: C.green, bg: 'rgba(0,214,143,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent users */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>Usuarios recientes</h2>
            <Link href="/admin/instructores" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <div>
            {recentUsers?.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderBottom: i < (recentUsers.length - 1) ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 12, color: C.purple2, flexShrink: 0 }}>
                  {u.display_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{new Date(u.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ padding: '2px 9px', borderRadius: 99, background: u.role_platform === 'super_admin' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.06)', color: u.role_platform === 'super_admin' ? C.purple2 : C.muted, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {u.role_platform === 'super_admin' ? '👑 Admin' : 'Usuario'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent communities */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>Comunidades recientes</h2>
          </div>
          <div>
            {recentCommunities?.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderBottom: i < (recentCommunities.length - 1) ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌐</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{c.member_count ?? 0} miembros · {c.access_type === 'free' ? 'Gratis' : `$${c.price_monthly}/mes`}</div>
                </div>
                <div style={{ padding: '2px 9px', borderRadius: 99, background: c.status === 'active' ? 'rgba(0,214,143,0.12)' : 'rgba(255,77,106,0.12)', color: c.status === 'active' ? C.green : C.red, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {c.status === 'active' ? '● Activa' : 'Inactiva'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      {subscriptions && subscriptions.length > 0 && (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>Suscripciones de creadores</h2>
          </div>
          <div>
            {subscriptions.map((s, i) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: 16, alignItems: 'center', padding: '12px 22px', borderBottom: i < subscriptions.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, textTransform: 'capitalize' }}>{s.plan}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: C.green }}>${s.amount}/mes</div>
                <div style={{ padding: '2px 9px', borderRadius: 99, background: s.status === 'active' ? 'rgba(0,214,143,0.12)' : 'rgba(255,77,106,0.12)', color: s.status === 'active' ? C.green : C.red, fontSize: 10, fontWeight: 700, width: 'fit-content' }}>{s.status}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{new Date(s.created_at).toLocaleDateString('es')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
