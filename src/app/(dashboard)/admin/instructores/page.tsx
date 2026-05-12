import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users } from 'lucide-react'

const C = { bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

export default async function AdminInstructoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('ec_profiles').select('role_platform').eq('id', user.id).single()
  if (profile?.role_platform !== 'super_admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('ec_profiles')
    .select('id, display_name, avatar_url, country, role_platform, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>Usuarios</h1>
        <p style={{ fontSize: 13, color: C.muted }}>{users?.length ?? 0} usuarios registrados</p>
      </div>

      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px', gap: 16, padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
          {['Usuario','País','Rol','Registro'].map(h => (
            <div key={h} style={{ fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {users?.map((u, i) => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px', gap: 16, padding: '14px 20px', borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: C.purple2, flexShrink: 0, overflow: 'hidden' }}>
                {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.display_name?.[0]?.toUpperCase() ?? '?')}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name}</div>
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>{u.country ?? '—'}</div>
            <div style={{ padding: '3px 10px', borderRadius: 99, background: u.role_platform === 'super_admin' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.06)', color: u.role_platform === 'super_admin' ? C.purple2 : C.muted, fontSize: 10, fontWeight: 700, width: 'fit-content' }}>
              {u.role_platform === 'super_admin' ? '👑 Admin' : 'Usuario'}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{new Date(u.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
