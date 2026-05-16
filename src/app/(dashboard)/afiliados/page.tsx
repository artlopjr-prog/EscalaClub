import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Copy, Users, DollarSign } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

export default async function AfiliadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('ec_profiles').select('display_name, username').eq('id', user.id).single()
  const referralCode = profile?.username ?? user.id.slice(0, 8)
  const referralLink = `https://escala-club.vercel.app/registro?ref=${referralCode}`

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>Programa de Afiliados 🤝</h1>
        <p style={{ fontSize: 14, color: C.muted }}>Gana comisiones invitando creadores a EscalaClub</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Referidos totales', value: '0', icon: Users, color: C.purple2, bg: 'rgba(124,58,237,0.1)' },
          { label: 'Comisiones ganadas', value: '$0', icon: DollarSign, color: C.green, bg: 'rgba(0,214,143,0.1)' },
          { label: 'Pendiente de pago', value: '$0', icon: TrendingUp, color: C.gold, bg: 'rgba(240,165,0,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={17} color={s.color} />
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 16 }}>Tu enlace de referido</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: C.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {referralLink}
          </div>
          <button
            
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
            <Copy size={14} /> Copiar
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>
          Comparte este enlace. Cuando alguien se registre y pague un plan de creador, recibes <strong style={{ color: C.green }}>20% de comisión mensual</strong> mientras sigan activos.
        </div>
      </div>

      {/* Coming soon */}
      <div style={{ background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.2)', borderRadius: 20, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 8 }}>Dashboard de afiliados en construcción</h3>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Pronto podrás ver tus referidos, comisiones y solicitar pagos directamente desde aquí.</p>
      </div>
    </div>
  )
}
