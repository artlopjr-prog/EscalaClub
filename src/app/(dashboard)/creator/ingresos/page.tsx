'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

const C = { bg1: 'var(--bg1)', bg2: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', muted2: 'var(--muted2)', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

export default function CreatorIngresosPage() {
  const supabase = createClient()
  const [community, setCommunity] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: comm } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
      if (comm) {
        setCommunity(comm)
        setMemberCount(comm.member_count ?? 0)
        const { data: sub } = await supabase.from('ec_creator_subscriptions').select('*').eq('community_id', comm.id).maybeSingle()
        setSubscription(sub)
      }
      setLoading(false)
    }
    load()
  }, [])

  const mrr = (community?.price_monthly ?? 0) * memberCount
  const planCost = subscription?.amount ?? 0
  const netMrr = mrr - planCost

  const stats = [
    { label: 'MRR estimado', value: `$${mrr.toFixed(0)}`, sub: 'ingresos mensuales brutos', icon: DollarSign, color: C.green, bg: 'rgba(0,214,143,0.1)' },
    { label: 'Ventas de cursos', value: '$0', sub: 'ingresos por cursos', icon: TrendingUp, color: C.purple2, bg: 'rgba(124,58,237,0.1)' },
    { label: 'Miembros activos', value: memberCount, sub: 'en tu comunidad', icon: Users, color: C.gold, bg: 'rgba(240,165,0,0.1)' },
    { label: 'Plan Komunio', value: `-$${planCost}/mes`, sub: 'costo de tu plan', icon: CreditCard, color: C.red, bg: 'rgba(255,77,106,0.1)' },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em', color: C.text, marginBottom: 6 }}>Ingresos</h1>
        <p style={{ fontSize: 13, color: C.muted }}>Resumen de tus ganancias en Komunio</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.sub}</div>
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Net income */}
      <div style={{ background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Ingreso neto estimado</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '-0.04em', color: netMrr >= 0 ? C.green : C.red }}>${netMrr.toFixed(0)}/mes</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>MRR comunidad + ventas de cursos – plan Komunio</div>
      </div>

      {/* Sales history */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>Historial de ventas</h2>
        </div>
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <p style={{ fontSize: 14, color: C.muted }}>Sin ventas aún — sigue construyendo tu audiencia</p>
        </div>
      </div>
    </div>
  )
}
