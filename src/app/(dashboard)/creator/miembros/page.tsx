'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Search, Shield, UserX, ChevronDown, Users, Crown, AlertTriangle, RotateCcw, Check, X } from 'lucide-react'

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
  const [banned, setBanned] = useState<any[]>([])
  const [rejoinRequests, setRejoinRequests] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'active'|'banned'|'requests'>('active')
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string|null>(null)
  const [banModal, setBanModal] = useState<{id:string, name:string}|null>(null)
  const [banReason, setBanReason] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: comm } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
    if (!comm) { router.push('/creator'); return }
    setCommunity(comm)

    const { data: all } = await supabase
      .from('ec_community_members')
      .select('*, profile:ec_profiles(id, display_name, avatar_url, country)')
      .eq('community_id', comm.id)
      .order('joined_at', { ascending: false })

    setMembers((all ?? []).filter(m => m.status === 'active'))
    setBanned((all ?? []).filter(m => m.status === 'banned'))
    setRejoinRequests((all ?? []).filter(m => m.status === 'banned' && m.rejoin_requested_at))
    setLoading(false)
  }

  async function changeRole(memberId: string, role: string) {
    await supabase.from('ec_community_members').update({ role }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
    setOpenMenu(null)
    toast.success('Rol actualizado')
  }

  async function confirmBan() {
    if (!banModal) return
    const m = members.find(x => x.id === banModal.id)
    if (!m) return

    await supabase.from('ec_community_members').update({
      status: 'banned',
      ban_reason: banReason || 'Violación de las reglas de la comunidad',
      banned_at: new Date().toISOString(),
    }).eq('id', banModal.id)

    // Notificación al miembro
    await supabase.from('ec_notifications').insert({
      user_id: m.user_id,
      type: 'ban',
      title: '⚠️ Has sido removido de una comunidad',
      body: `Fuiste removido de "${community.name}". Motivo: ${banReason || 'Violación de las reglas'}. Puedes solicitar volver si crees que fue un error.`,
      action_url: `/comunidades/${community.slug}`,
      is_read: false,
    })

    setMembers(prev => prev.filter(x => x.id !== banModal.id))
    setBanned(prev => [...prev, { ...m, status: 'banned', ban_reason: banReason }])
    setBanModal(null)
    setBanReason('')
    toast.success(`${banModal.name} fue removido y notificado`)
  }

  async function unban(memberId: string, name: string) {
    await supabase.from('ec_community_members').update({
      status: 'active',
      ban_reason: null,
      banned_at: null,
      rejoin_requested_at: null,
      rejoin_message: null,
    }).eq('id', memberId)

    const m = banned.find(x => x.id === memberId)
    if (m) {
      await supabase.from('ec_notifications').insert({
        user_id: m.user_id,
        type: 'unban',
        title: '✅ Tu solicitud fue aceptada',
        body: `El creador de "${community.name}" aceptó tu solicitud de regreso. ¡Bienvenido de vuelta!`,
        action_url: `/comunidades/${community.slug}`,
        is_read: false,
      })
    }

    setBanned(prev => prev.filter(x => x.id !== memberId))
    setRejoinRequests(prev => prev.filter(x => x.id !== memberId))
    if (m) setMembers(prev => [...prev, { ...m, status: 'active' }])
    toast.success(`${name} fue readmitido`)
  }

  async function denyRejoin(memberId: string, name: string) {
    await supabase.from('ec_community_members').update({
      rejoin_requested_at: null,
      rejoin_message: null,
    }).eq('id', memberId)

    const m = banned.find(x => x.id === memberId)
    if (m) {
      await supabase.from('ec_notifications').insert({
        user_id: m.user_id,
        type: 'rejoin_denied',
        title: '❌ Solicitud de regreso denegada',
        body: `El creador de "${community.name}" no aceptó tu solicitud de regreso en este momento.`,
        action_url: `/comunidades/${community.slug}`,
        is_read: false,
      })
    }

    setBanned(prev => prev.map(x => x.id === memberId ? { ...x, rejoin_requested_at: null, rejoin_message: null } : x))
    setRejoinRequests(prev => prev.filter(x => x.id !== memberId))
    toast.success(`Solicitud de ${name} denegada`)
  }

  const filtered = (tab === 'active' ? members : tab === 'banned' ? banned : rejoinRequests)
    .filter(m => !q || (m.profile?.display_name ?? '').toLowerCase().includes(q.toLowerCase()))

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/creator" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 12 }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em', color: C.text, marginBottom: 2 }}>👥 Miembros</h1>
          <p style={{ fontSize: 12, color: C.muted }}>{members.length} activos · {banned.length} baneados · {rejoinRequests.length} solicitudes pendientes</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Activos', value: members.length, icon: Users, color: C.green },
          { label: 'Baneados', value: banned.length, icon: UserX, color: C.red },
          { label: 'Solicitudes', value: rejoinRequests.length, icon: RotateCcw, color: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => setTab(i === 0 ? 'active' : i === 1 ? 'banned' : 'requests')}>
            <s.icon size={18} color={s.color} />
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 22, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['active','Activos'],['banned','Baneados'],['requests','Solicitudes de regreso']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val as any)} style={{
            padding: '7px 16px', borderRadius: 10, fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            background: tab === val ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : C.bg1,
            color: tab === val ? '#fff' : C.muted, border: `1px solid ${tab === val ? 'transparent' : C.border}`, cursor: 'pointer',
          }}>{label}{val === 'requests' && rejoinRequests.length > 0 ? ` (${rejoinRequests.length})` : ''}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." style={{ width: '100%', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px 10px 40px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* List */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        {filtered.map((m, i) => {
          const profile = m.profile as any
          const roleInfo = ROLES.find(r => r.value === m.role) ?? ROLES[0]
          return (
            <div key={m.id} style={{ padding: '16px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
              {/* Avatar */}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: C.purple2, flexShrink: 0, overflow: 'hidden' }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.display_name?.[0]?.toUpperCase() ?? '?')}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{profile?.display_name ?? 'Usuario'}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {tab === 'active' && <span style={{ color: roleInfo.color }}>{roleInfo.icon} {roleInfo.label} · {profile?.country ?? '—'}</span>}
                  {tab === 'banned' && <span style={{ color: C.red }}>🚫 Motivo: {m.ban_reason ?? 'Sin especificar'}</span>}
                  {tab === 'requests' && <span style={{ color: C.gold }}>💬 "{m.rejoin_message ?? 'Sin mensaje'}"</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, position: 'relative', flexShrink: 0 }}>
                {tab === 'active' && (
                  <>
                    <button onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, background: C.bg2, border: `1px solid ${C.border}`, color: C.muted2, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                      Rol <ChevronDown size={11} />
                    </button>
                    <button onClick={() => { setBanModal({ id: m.id, name: profile?.display_name ?? 'usuario' }); setOpenMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,77,106,0.1)', border: `1px solid rgba(255,77,106,0.2)`, color: C.red, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                      <UserX size={12} /> Banear
                    </button>
                    {openMenu === m.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenu(null)} />
                        <div style={{ position: 'absolute', top: '100%', right: 0, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, zIndex: 50, minWidth: 140, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', marginTop: 4 }}>
                          {ROLES.map(r => (
                            <button key={r.value} onClick={() => changeRole(m.id, r.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: m.role === r.value ? r.color + '15' : 'transparent', border: 'none', cursor: 'pointer', color: m.role === r.value ? r.color : C.muted2, fontSize: 12, fontWeight: 600 }}>
                              {r.icon} {r.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                {(tab === 'banned' || tab === 'requests') && (
                  <>
                    <button onClick={() => unban(m.id, profile?.display_name ?? 'usuario')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,214,143,0.1)', border: `1px solid rgba(0,214,143,0.2)`, color: C.green, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                      <Check size={12} /> Readmitir
                    </button>
                    {tab === 'requests' && (
                      <button onClick={() => denyRejoin(m.id, profile?.display_name ?? 'usuario')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,77,106,0.1)', border: `1px solid rgba(255,77,106,0.2)`, color: C.red, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        <X size={12} /> Denegar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
            {tab === 'active' ? 'Sin miembros activos aún' : tab === 'banned' ? 'Nadie baneado' : 'Sin solicitudes pendientes'}
          </div>
        )}
      </div>

      {/* Ban modal */}
      {banModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color={C.red} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 18, color: C.text }}>Banear miembro</h2>
                <p style={{ fontSize: 13, color: C.muted }}>Se le notificará y podrá pedir volver</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.muted2, marginBottom: 16 }}>Estás a punto de banear a <strong style={{ color: C.text }}>{banModal.name}</strong>. Recibirá una notificación con el motivo.</p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted2, marginBottom: 8, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motivo (opcional)</label>
            <textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Ej: Spam, comportamiento inapropiado, incumplimiento de reglas..." style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box', fontFamily: 'Outfit, sans-serif' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => { setBanModal(null); setBanReason('') }} style={{ flex: 1, padding: '12px', borderRadius: 12, background: C.bg2, border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14 }}>Cancelar</button>
              <button onClick={confirmBan} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #FF4D6A, #cc3355)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14 }}>Confirmar ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
