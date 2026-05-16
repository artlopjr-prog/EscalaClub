'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Zap, Crown, Sparkles, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', danger: '#FF4D6A' }

const PLANS = [
  {
    id: 'starter', name: 'Starter', Icon: Rocket,
    desc: 'Para empezar tu primera comunidad',
    monthly: 39, annual: 374,
    color: '#3B82F6',
    limit: '100 miembros',
    features: ['1 comunidad activa','Hasta 100 miembros','Cursos ilimitados','Foro con canales','Eventos en vivo','Certificados automáticos','Analytics básico','Soporte por email'],
  },
  {
    id: 'creator', name: 'Creator', Icon: Sparkles,
    desc: 'Para creadores en crecimiento serio',
    monthly: 79, annual: 758,
    color: '#7C3AED', popular: true,
    limit: '1,000 miembros',
    features: ['1 comunidad activa','Hasta 1,000 miembros','Todo lo de Starter','Programa de afiliados','Analytics avanzado','Notificaciones WhatsApp','Badge verificado','Soporte prioritario'],
  },
  {
    id: 'pro', name: 'Pro', Icon: Crown,
    desc: 'Para negocios educativos a escala',
    monthly: 129, annual: 1238,
    color: '#F0A500',
    limit: 'Miembros ilimitados',
    features: ['Comunidades ilimitadas','Miembros ilimitados','Todo lo de Creator','API access','Manager dedicado','White-label (próximamente)','SLA garantizado','Onboarding personalizado'],
  },
]

export default function PreciosPage() {
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly')
  const [loading, setLoading] = useState<string|null>(null)
  const [currentPlan, setCurrentPlan] = useState<string|null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('ec_creator_subscriptions').select('plan,status').eq('status','active').maybeSingle()
      .then(({ data }) => { if (data) setCurrentPlan(data.plan) })
  }, [])

  async function handleSelectPlan(planId: string) {
    setLoading(planId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    // Por ahora guardamos intent y dirigimos a contacto para pago manual
    // Cuando PayPal esté conectado, aquí irá la URL de suscripción PayPal
    await supabase.from('ec_creator_subscriptions').upsert({
      member_id: user.id,
      plan: planId,
      billing_cycle: billing,
      status: 'pending',
      price_usd: billing === 'monthly' ? PLANS.find(p => p.id === planId)!.monthly : PLANS.find(p => p.id === planId)!.annual,
    }, { onConflict: 'member_id' })
    toast.success('¡Plan seleccionado! Te contactaremos para activar el pago.')
    setLoading(null)
    router.push('/creator')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '32px 24px 80px' }}>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 13, marginBottom: 40 }}>
        <ArrowLeft size={14} /> Volver
      </Link>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: C.text }}>Planes para Creadores</span>
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 42, letterSpacing: '-0.04em', color: C.text, marginBottom: 12, lineHeight: 1.1 }}>
          Construye tu<br />
          <span style={{ background: 'linear-gradient(135deg, #9F67FF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>comunidad ideal</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: '0 auto 12px' }}>
          Sin comisiones por venta. Tú cobras directo a tus miembros por PayPal.
        </p>
        <p style={{ fontSize: 13, color: C.muted, maxWidth: 440, margin: '0 auto 32px' }}>
          Lo que cobres a tus miembros es 100% tuyo. EscalaClub solo cobra el plan mensual.
        </p>

        <div style={{ display: 'inline-flex', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {[{ val: 'monthly', label: 'Mensual' }, { val: 'annual', label: 'Anual -20%' }].map(opt => (
            <button key={opt.val} onClick={() => setBilling(opt.val as any)} style={{
              padding: '8px 24px', borderRadius: 9, fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              background: billing === opt.val ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'transparent',
              color: billing === opt.val ? '#fff' : C.muted, border: 'none', cursor: 'pointer',
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto 56px' }}>
        {PLANS.map(plan => {
          const price = billing === 'monthly' ? plan.monthly : plan.annual
          const isCurrentPlan = currentPlan === plan.id
          return (
            <div key={plan.id} style={{
              background: plan.popular ? `linear-gradient(145deg, ${plan.color}15, ${C.bg1})` : C.bg1,
              border: `2px solid ${plan.popular ? plan.color + '50' : C.border}`,
              borderRadius: 24, padding: 28, position: 'relative', display: 'flex', flexDirection: 'column',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plan.color}, #9F67FF)`, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 99, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                  ⚡ MÁS POPULAR
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: plan.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <plan.Icon size={22} color={plan.color} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 18, color: C.text }}>{plan.name}</div>
                  <div style={{ fontSize: 11, color: plan.color, fontWeight: 700 }}>{plan.limit}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 40, color: C.text }}>${price}</span>
                <span style={{ fontSize: 14, color: C.muted }}>/{billing === 'monthly' ? 'mes' : 'año'}</span>
                {billing === 'annual' && <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 4 }}>Ahorra ${(plan.monthly * 12) - plan.annual}/año</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: plan.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={11} color={plan.color} />
                    </div>
                    <span style={{ fontSize: 13, color: C.muted2, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={!!loading || isCurrentPlan}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, cursor: isCurrentPlan ? 'default' : 'pointer',
                  background: isCurrentPlan ? 'rgba(0,214,143,0.1)' : plan.popular ? `linear-gradient(135deg, ${plan.color}, #9F67FF)` : plan.color + '20',
                  color: isCurrentPlan ? C.green : plan.popular ? '#fff' : plan.color,
                  fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14,
                  opacity: loading && loading !== plan.id ? 0.5 : 1,
                  border: isCurrentPlan ? `1px solid rgba(0,214,143,0.3)` : 'none',
                }}
              >
                {isCurrentPlan ? '✓ Plan actual' : loading === plan.id ? 'Procesando...' : `Elegir ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 0', borderTop: `1px solid ${C.border}` }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, color: C.text, textAlign: 'center', marginBottom: 32 }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            ['¿Puedo cambiar de plan?', 'Sí, puedes subir o bajar de plan en cualquier momento. El cambio aplica desde el siguiente ciclo de facturación.'],
            ['¿Qué pasa con mis miembros si cancelo?', 'Tendrás acceso hasta el final del período pagado. Luego tu comunidad se pausará y los miembros no podrán acceder hasta que reactives.'],
            ['¿Cómo cobro a mis miembros?', 'Conectas tu cuenta PayPal en la configuración de tu comunidad. Tú defines el precio y el dinero llega directo a ti — sin comisiones de EscalaClub.'],
            ['¿Hay un período de prueba?', 'Puedes crear tu perfil y configurar tu comunidad gratis. El plan se activa cuando decides publicarla y cobrar.'],
            ['¿EscalaClub toma comisión de mis ventas?', 'No. EscalaClub cobra el plan mensual, y los pagos de tus miembros son 100% tuyos. Sin comisiones ocultas.'],
          ].map(([q, a]) => (
            <div key={q} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 8 }}>{q}</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
