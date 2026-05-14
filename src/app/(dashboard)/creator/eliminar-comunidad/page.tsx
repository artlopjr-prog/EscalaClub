'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', red: '#FF4D6A', gold: '#F0A500' }

export default function EliminarComunidadPage() {
  const supabase = createClient()
  const router = useRouter()
  const [community, setCommunity] = useState<any>(null)
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [initiated, setInitiated] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (!data) { router.push('/creator'); return }
          setCommunity(data)
          if (data.deletion_requested_at) setInitiated(true)
        })
    })
  }, [])

  async function handleInitiateDeletion() {
    if (confirm !== community?.name) { toast.error('El nombre no coincide'); return }
    setLoading(true)

    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + 30)

    const { error } = await supabase.from('ec_communities').update({
      deletion_requested_at: new Date().toISOString(),
      deletion_scheduled_at: deletionDate.toISOString(),
      status: 'pending_deletion',
    }).eq('id', community.id)

    if (error) { toast.error('Error: ' + error.message); setLoading(false); return }

    // Notify all members
    const { data: members } = await supabase
      .from('ec_community_members')
      .select('user_id')
      .eq('community_id', community.id)
      .eq('status', 'active')

    if (members && members.length > 0) {
      const notifications = members.map(m => ({
        user_id: m.user_id,
        type: 'community_deletion',
        title: '⚠️ Una comunidad será eliminada',
        body: `La comunidad "${community.name}" será eliminada el ${deletionDate.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}. No se harán cobros adicionales. Descarga tu contenido antes de esa fecha.`,
        action_url: `/comunidades/${community.slug}`,
        is_read: false,
      }))
      await supabase.from('ec_notifications').insert(notifications)
    }

    setInitiated(true)
    setLoading(false)
    toast.success('Proceso iniciado. Los miembros fueron notificados.')
  }

  async function handleCancelDeletion() {
    setLoading(true)
    await supabase.from('ec_communities').update({
      deletion_requested_at: null,
      deletion_scheduled_at: null,
      status: 'active',
    }).eq('id', community.id)

    setInitiated(false)
    setConfirm('')
    setLoading(false)
    toast.success('Eliminación cancelada. Tu comunidad sigue activa.')
  }

  if (!community) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  const scheduledDate = community.deletion_scheduled_at
    ? new Date(community.deletion_scheduled_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ padding: 28, maxWidth: 600, margin: '0 auto' }}>
      <Link href="/creator" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 12, marginBottom: 32 }}>
        <ArrowLeft size={13} /> Volver al panel
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={24} color={C.red} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: C.text }}>Eliminar comunidad</h1>
          <p style={{ fontSize: 13, color: C.muted }}>{community.name}</p>
        </div>
      </div>

      {initiated ? (
        /* Already initiated */
        <div>
          <div style={{ background: 'rgba(255,77,106,0.06)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={22} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.red, marginBottom: 8 }}>Eliminación programada</h2>
                <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.7 }}>
                  Tu comunidad será eliminada el <strong style={{ color: C.text }}>{scheduledDate}</strong>.<br />
                  Todos los miembros fueron notificados. No se hacen cobros nuevos.<br />
                  Los miembros mantienen acceso hasta esa fecha.
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 8 }}>¿Cambiaste de opinión?</h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Puedes cancelar el proceso y tu comunidad volverá a estar activa normalmente.</p>
            <button onClick={handleCancelDeletion} disabled={loading} style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Cancelando...' : '↩️ Cancelar eliminación'}
            </button>
          </div>
        </div>
      ) : (
        /* Initiate deletion */
        <div>
          <div style={{ background: 'rgba(255,77,106,0.06)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.red, marginBottom: 12 }}>⚠️ Lee esto antes de continuar</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Los miembros serán notificados inmediatamente',
                'No se admitirán nuevos miembros desde hoy',
                'Los miembros actuales mantienen acceso los 30 días',
                'La comunidad se eliminará definitivamente después de 30 días',
                'Todo el contenido (posts, cursos, eventos) será eliminado permanentemente',
                'Esta acción no se puede deshacer después del período de 30 días',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: C.muted2, lineHeight: 1.5 }}>
                  <span style={{ color: C.red, fontWeight: 700, flexShrink: 0 }}>•</span> {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: C.muted2, marginBottom: 12, lineHeight: 1.6 }}>
              Para confirmar, escribe el nombre exacto de tu comunidad:<br />
              <strong style={{ color: C.text }}>{community.name}</strong>
            </label>
            <input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={community.name}
              style={{ width: '100%', background: C.bg2, border: `1px solid ${confirm === community.name ? C.red : C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
            />
            <button
              onClick={handleInitiateDeletion}
              disabled={confirm !== community.name || loading}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: confirm === community.name ? 'linear-gradient(135deg, #FF4D6A, #cc3355)' : 'rgba(255,77,106,0.15)', border: 'none', color: confirm === community.name ? '#fff' : C.red, cursor: confirm === community.name ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Iniciando proceso...' : '🗑️ Iniciar eliminación en 30 días'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
