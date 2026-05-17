'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LogOut, X } from 'lucide-react'

const C = { bg1: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', muted2: 'var(--muted2)', red: '#FF4D6A' }

interface Props {
  communityId: string
  communityName: string
  membershipId: string
  userId: string
  isPaid: boolean
  accessUntil: string | null
}

export default function LeaveButton({ communityId, communityName, membershipId, userId, isPaid, accessUntil }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLeave() {
    setLoading(true)
    const { error } = await supabase
      .from('ec_community_members')
      .update({ status: 'cancelled' })
      .eq('id', membershipId)

    if (error) { toast.error('Error al salir: ' + error.message); setLoading(false); return }

    await supabase.from('ec_notifications').insert({
      user_id: userId,
      type: 'left_community',
      title: '👋 Saliste de una comunidad',
      body: isPaid
        ? `Saliste de "${communityName}". Mantendrás acceso hasta ${accessUntil ? new Date(accessUntil).toLocaleDateString('es') : 'fin del período pagado'}.`
        : `Saliste de "${communityName}". Puedes volver a unirte cuando quieras.`,
      action_url: `/comunidades`,
      is_read: false,
    })

    toast.success(isPaid ? `Saliste. Mantienes acceso hasta fin del período pagado` : `Saliste de ${communityName}`)
    setShowModal(false)
    router.push('/comunidades')
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 12, background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: C.red, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13 }}>
        <LogOut size={14} /> Salir de la comunidad
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--border)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}>
              <X size={16} />
            </button>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <LogOut size={24} color={C.red} />
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: C.text, marginBottom: 10 }}>¿Salir de {communityName}?</h2>
            {isPaid ? (
              <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.6, marginBottom: 24 }}>
                Mantendrás acceso hasta el final de tu período pagado. No se realizarán cobros futuros.
                {accessUntil && <><br /><br /><strong style={{ color: C.text }}>Acceso hasta:</strong> {new Date(accessUntil).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
              </p>
            ) : (
              <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.6, marginBottom: 24 }}>
                Perderás acceso inmediatamente. Podrás volver a unirte cuando quieras.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--border)', border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>Cancelar</button>
              <button onClick={handleLeave} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #FF4D6A, #cc3355)', border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saliendo...' : 'Confirmar salida'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
