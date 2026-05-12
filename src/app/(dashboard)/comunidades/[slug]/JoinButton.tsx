'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Users, Check } from 'lucide-react'

interface Props {
  communityId: string
  communityName: string
  accessType: string
  priceMonthly: number
  isMember: boolean
  accentColor: string
  userId: string
}

export default function JoinButton({ communityId, communityName, accessType, priceMonthly, isMember, accentColor, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(isMember)
  const router = useRouter()
  const supabase = createClient()

  async function handleJoin() {
    if (joined) return
    if (accessType === 'paid') {
      toast('Los pagos se activarán próximamente con PayPal 🚧', { icon: '💳', duration: 4000 })
      return
    }
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
      // Increment member count
      try { await supabase.rpc('increment_member_count', { community_id_param: communityId }) } catch {}
      // Send join email (non-blocking)
      fetch('/api/emails/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId, communityName, communitySlug: window.location.pathname.split('/')[2] }),
      }).catch(() => {})
      toast.success(`¡Bienvenido a ${communityName}! 🎉`)
      setJoined(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (joined) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.3)', color: '#00D68F', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
      <Check size={16} /> Miembro activo
    </div>
  )

  return (
    <button onClick={handleJoin} disabled={loading} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '12px 24px', borderRadius: 12,
      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
      color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
      opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
      boxShadow: `0 0 20px ${accentColor}44`,
    }}>
      <Users size={16} />
      {loading ? 'Uniéndote...' : accessType === 'paid' ? `Unirse — $${priceMonthly}/mes` : 'Unirse gratis'}
    </button>
  )
}
