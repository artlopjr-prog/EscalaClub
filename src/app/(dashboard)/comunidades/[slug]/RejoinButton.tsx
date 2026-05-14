'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { RotateCcw, X } from 'lucide-react'

const C = { bg1: '#0D0D14', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', gold: '#F0A500' }

interface Props {
  membershipId: string
  communityName: string
  alreadyRequested: boolean
}

export default function RejoinButton({ membershipId, communityName, alreadyRequested }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(alreadyRequested)
  const supabase = createClient()

  async function handleRequest() {
    setLoading(true)
    const { error } = await supabase.from('ec_community_members').update({
      rejoin_requested_at: new Date().toISOString(),
      rejoin_message: message.trim() || null,
    }).eq('id', membershipId)

    if (error) { toast.error('Error: ' + error.message); setLoading(false); return }

    setRequested(true)
    setShowModal(false)
    toast.success('Solicitud enviada al creador 📩')
    setLoading(false)
  }

  if (requested) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 12, background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', color: C.gold, fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
      ⏳ Solicitud enviada — esperando respuesta
    </div>
  )

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 12, background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', color: C.gold, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
        <RotateCcw size={14} /> Pedir volver a entrar
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}>
              <X size={16} />
            </button>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(240,165,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <RotateCcw size={24} color={C.gold} />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 20, color: C.text, marginBottom: 8 }}>Pedir volver a {communityName}</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>El creador revisará tu solicitud. Puedes dejar un mensaje explicando por qué crees que fue un error.</p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#9998B0', marginBottom: 8, fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tu mensaje (opcional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Ej: Creo que fue un malentendido, me comprometo a respetar las reglas..." style={{ width: '100%', background: '#13131C', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box', fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>Cancelar</button>
              <button onClick={handleRequest} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #F0A500, #cc8800)', border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
