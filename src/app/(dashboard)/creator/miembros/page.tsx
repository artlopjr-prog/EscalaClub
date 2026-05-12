'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Search, Shield, UserX, ChevronDown, Users, Crown, Star } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', red: '#FF4D6A', gold: '#F0A500' }

const ROLES = [
  { value: 'member', label: 'Miembro', icon: '👤', color: C.muted },
  { value: 'moderator', label: 'Moderador', icon: '🛡️', color: '#3B82F6' },
  { value: 'admin', label: 'Admin', icon: '⭐', color: C.gold },
]

export default function MiembrosPage() {
  const supabase = createClient()
  const router = useRouter()
  const [community, setCommunity] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: comm } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
      if (!comm) { router.push('/creator'); return }
      setCommunity(comm)
      const { data: m } = await supabase
        .from('ec_community_members')
        .select('*, profile:ec_profiles(id, display_name, avatar_url, country, bio)')
        .eq('community_id', comm.id)
        .order('joined_at', { ascending: false })
      setMembers(m ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function changeRole(memberId: string, role: string) {
    await supabase.from('ec_community_members').update({ role }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
    setOpenMenu(null)
    toast.success(`Rol actualizado a ${role}`)
  }

  async function removeMember(memberId: string, name: string) {
    if (!confirm(`¿Expulsar a ${name} de la comunidad?`)) return
    await supabase.from('ec_community_members').update({ status: 'banned' }).eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
    toast.success(`${name} fue expulsado`)
  }

  const filtered = members.filter(m => {
    const profile = m.profile as any
    return !q || (profile?.display_name ?? '').toLowerCase().includes(q.toLowerCase()) || (profile?.country ?? '').toLowerCase().includes(q.toLowerCase())
  })

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/creator" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 12 }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em', color: C.text, marginBottom: 2 }}>👥 Miembros</h1>
          <p style={{ fontSize: 12, color: C.muted }}>{members.length} miembros activos en {community?.name}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={14} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o país..." style={{ width: '100%', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px 11px 40px', color: C.text, fontSize: 14, outline: 'none' }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total miembros', value: members.length, icon: Users, color: C.purple2 },
          { label: 'Moderadores', value: members.filter(m => m.role === 'moderator').length, icon: Shield, color: '#3B82F6' },
          { label: 'Admins', value: members.filter(m => m.role === 'admin').length, icon: Crown, color: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <s.icon size={18} color={s.color} />
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px', gap: 16, padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
          {['Miembro', 'País', 'Puntos', 'Acciones'].map(h => (
            <div key={h} style={{ fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {filtered.map((m, i) => {
          const profile = m.profile as any
          const roleInfo = ROLES.find(r => r.value === m.role) ?? ROLES[0]
          return (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px', gap: 16, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: C.purple2, flexShrink: 0, overflow: 'hidden' }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.display_name?.[0]?.toUpperCase() ?? '?')}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{profile?.display_name ?? 'Usuario'}</div>
                  <div style={{ fontSize: 10, color: roleInfo.color, fontWeight: 700 }}>{roleInfo.icon} {roleInfo.label}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{profile?.country ?? '—'}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: C.text }}>{(m.points ?? 0).toLocaleString()}</div>
              <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
                <button onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, background: C.bg2, border: `1px solid ${C.border}`, color: C.muted2, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  Rol <ChevronDown size={11} />
                </button>
                {openMenu === m.id && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, zIndex: 50, minWidth: 140, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                    {ROLES.map(r => (
                      <button key={r.value} onClick={() => changeRole(m.id, r.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: m.role === r.value ? r.color + '15' : 'transparent', border: 'none', cursor: 'pointer', color: m.role === r.value ? r.color : C.muted2, fontSize: 12, fontWeight: 600, textAlign: 'left' }}>
                        {r.icon} {r.label}
                      </button>
                    ))}
                    <div style={{ height: 1, background: C.border, margin: '6px 0' }} />
                    <button onClick={() => removeMember(m.id, profile?.display_name ?? 'usuario')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.red, fontSize: 12, fontWeight: 600 }}>
                      <UserX size={13} /> Expulsar
                    </button>
                  </div>
                )}
                {openMenu === m.id && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenu(null)} />}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
            {q ? 'No se encontraron miembros' : 'Sin miembros aún'}
          </div>
        )}
      </div>
    </div>
  )
}
