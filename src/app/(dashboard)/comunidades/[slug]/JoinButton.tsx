'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Users, Check, CreditCard, X } from 'lucide-react'

const C = { bg: 'var(--bg)', bg1: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', green: '#00D68F' }

interface Props {
  communityId: string
  communityName: string
  communitySlug: string
  accessType: string
  priceMonthly: number
  paypalEmail: string | null
  isMember: boolean
  accentColor: string
  userId: string
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function JoinButton({ communityId, communityName, communitySlug, accessType, priceMonthly, paypalEmail, isMember, accentColor, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(isMember)
  const [showPayPal, setShowPayPal] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const paypalRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load PayPal SDK when modal opens
  useEffect(() => {
    if (!showPayPal || accessType !== 'paid') return
    if (window.paypal) { setSdkReady(true); return }

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`
    script.async = true
    script.onload = () => setSdkReady(true)
    script.onerror = () => toast.error('Error cargando PayPal')
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [showPayPal, accessType])

  // Render PayPal button when SDK is ready
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || !showPayPal) return
    paypalRef.current.innerHTML = ''

    if (!paypalEmail) {
      toast.error('Este creador aún no ha configurado su cuenta PayPal')
      setShowPayPal(false)
      return
    }

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 },

      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: `Membresía — ${communityName}`,
            amount: { currency_code: 'USD', value: priceMonthly.toFixed(2) },
            payee: { email_address: paypalEmail },
          }]
        })
      },

      onApprove: async (_data: any, actions: any) => {
        setLoading(true)
        try {
          const order = await actions.order.capture()
          if (order.status === 'COMPLETED') {
            // Register membership in DB
            const { error } = await supabase.from('ec_community_members').insert({
              community_id: communityId,
              user_id: userId,
              role: 'member',
              status: 'active',
              points: 0,
            })
            if (error && !error.message.includes('duplicate')) {
              toast.error('Error registrando membresía: ' + error.message)
              setLoading(false)
              return
            }
            // Increment member count
            try { await supabase.rpc('increment_member_count', { community_id_param: communityId }) } catch {}
            // Send join email
            fetch('/api/emails/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ communityId, communityName, communitySlug }),
            }).catch(() => {})

            setJoined(true)
            setShowPayPal(false)
            toast.success(`¡Bienvenido a ${communityName}! 🎉`)
            router.refresh()
          }
        } catch {
          toast.error('Error procesando el pago')
        }
        setLoading(false)
      },

      onCancel: () => {
        setShowPayPal(false)
        toast('Pago cancelado', { icon: '⚠️' })
      },

      onError: (err: any) => {
        console.error('PayPal error:', err)
        toast.error('Error con PayPal. Intenta de nuevo.')
        setShowPayPal(false)
      },
    }).render(paypalRef.current)
  }, [sdkReady, showPayPal])

  // Already a member
  if (joined) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.3)', color: C.green, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>
      <Check size={16} /> Miembro activo
    </div>
  )

  async function handleJoinFree() {
    if (loading) return
    setLoading(true)
    const { error } = await supabase.from('ec_community_members').insert({
      community_id: communityId,
      user_id: userId,
      role: 'member',
      status: 'active',
      points: 0,
    })
    if (error) {
      toast.error('Error al unirte: ' + error.message)
    } else {
      try { await supabase.rpc('increment_member_count', { community_id_param: communityId }) } catch {}
      fetch('/api/emails/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId, communityName, communitySlug }),
      }).catch(() => {})
      toast.success(`¡Bienvenido a ${communityName}! 🎉`)
      setJoined(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      {/* Join button */}
      <button
        onClick={accessType === 'paid' ? () => setShowPayPal(true) : handleJoinFree}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 12,
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
          boxShadow: `0 0 20px ${accentColor}44`,
        }}
      >
        {accessType === 'paid' ? <CreditCard size={16} /> : <Users size={16} />}
        {loading ? 'Procesando...' : accessType === 'paid' ? `Unirse — $${priceMonthly}/mes` : 'Unirse gratis'}
      </button>

      {/* PayPal Modal */}
      {showPayPal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, position: 'relative' }}>
            <button onClick={() => setShowPayPal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--border)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}>
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: accentColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🌐</div>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: C.text, marginBottom: 6 }}>Unirse a {communityName}</h2>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 4 }}>Membresía mensual</p>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 36, color: C.text }}>${priceMonthly}<span style={{ fontSize: 16, color: C.muted, fontWeight: 400 }}>/mes</span></div>
            </div>

            <div style={{ background: 'var(--bg1)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              ✅ Acceso inmediato al foro, chat, cursos y eventos<br />
              ✅ El pago va directo al creador por PayPal<br />
              ✅ Cancela cuando quieras
            </div>

            {!sdkReady ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: C.muted, fontSize: 13 }}>
                Cargando PayPal...
              </div>
            ) : (
              <div ref={paypalRef} />
            )}
          </div>
        </div>
      )}
    </>
  )
}
