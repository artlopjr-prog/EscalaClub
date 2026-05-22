'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, Users, Globe, TrendingUp, Star, Crown } from 'lucide-react'
import PayPalButton from '@/components/paypal/PayPalButton'
import { PLAN_PRICES, getYearlySavings } from '@/lib/paypal'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    emoji: '🚀',
    description: 'Para empezar tu primera comunidad',
    features: [
      '1 comunidad activa',
      'Hasta 100 miembros',
      'Cursos ilimitados',
      'Foro con canales',
      'Certificados automáticos',
      'Analytics básico',
      'Soporte por email',
    ],
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/30',
    highlight: false,
  },
  {
    id: 'creator' as const,
    name: 'Creator',
    emoji: '⚡',
    description: 'Para creadores en crecimiento serio',
    features: [
      '1 comunidad activa',
      'Hasta 1,000 miembros',
      'Todo lo de Starter',
      'Programa de afiliados',
      'Eventos en vivo (Zoom/Meet)',
      'Analytics avanzado',
      'WhatsApp notifications',
      'Soporte prioritario',
    ],
    icon: TrendingUp,
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/50',
    highlight: true,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    emoji: '👑',
    description: 'Para negocios educativos a escala',
    features: [
      'Comunidades ilimitadas',
      'Miembros ilimitados',
      'Todo lo de Creator',
      'Badge verificado ✓',
      'API access',
      'White-label (próximamente)',
      'Manager dedicado',
      'SLA 99.9% uptime',
    ],
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30',
    highlight: false,
  },
]

interface PricingPageProps {
  currentPlan?: string | undefined
  memberId?: string | undefined
}

export default function PricingPage({ currentPlan, memberId }: PricingPageProps) {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const handleSubscriptionSuccess = async (subscriptionId: string, planTier: string) => {
    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('ec_creator_subscriptions')
          .upsert({
            member_id: memberId,
            plan: planTier,
            status: 'active',
            paypal_subscription_id: subscriptionId,
            billing_cycle: cycle,
            price_usd: PLAN_PRICES[planTier as keyof typeof PLAN_PRICES][cycle as "monthly" | "annual"],
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (cycle === 'monthly' ? 30 : 365) * 86400000).toISOString(),
          }, { onConflict: 'member_id' })

        if (error) throw error

        toast.success(`🎉 ¡Plan ${planTier} activado! Bienvenido a Komunio`)
        router.push('/comunidad/crear')
        router.refresh()
      } catch (err) {
        console.error(err)
        toast.error('Error al activar el plan. Contacta soporte.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
          <Star className="w-4 h-4" />
          <span>Elige tu plan de creador</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Construye tu{' '}
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            comunidad rentable
          </span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Sin comisiones por venta. Sin límites de contenido. Tú cobras directo a tus miembros.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 mt-8 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setCycle('monthly')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              cycle === 'monthly'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setCycle('annual')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              cycle === 'annual'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Anual
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              2 meses gratis
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price = PLAN_PRICES[plan.id][cycle]
          const savings = getYearlySavings(plan.id)
          const isSelected = selectedPlan === plan.id
          const isCurrent = currentPlan === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 ${
                plan.highlight
                  ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-purple-500/5 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
                  : 'border-white/10 bg-white/3 hover:bg-white/5'
              } ${isSelected ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold shadow-lg">
                  MÁS POPULAR
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {plan.emoji}
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-white/50 text-sm mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  <span className="text-white/40 text-sm pb-1">/mes</span>
                </div>
                {cycle === 'annual' && (
                  <div className="text-emerald-400 text-sm mt-1">
                    Ahorras ${savings}/año
                  </div>
                )}
                {cycle === 'annual' && (
                  <div className="text-white/40 text-xs mt-0.5">
                    ${PLAN_PRICES[plan.id].annual} facturado anualmente
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-medium">
                  ✓ Plan actual
                </div>
              ) : isSelected ? (
                <PayPalButton
                  planTier={plan.id}
                  billingCycle={cycle}
                  onSuccess={(subId) => handleSubscriptionSuccess(subId, plan.id)}
                  onError={() => toast.error('Error con PayPal. Intenta de nuevo.')}
                  onCancel={() => setSelectedPlan(null)}
                />
              ) : (
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                  }`}
                >
                  Elegir {plan.name}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Trust badges */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🔒', title: 'Pago seguro', desc: 'PayPal protege cada transacción' },
          { icon: '❌', title: 'Sin comisiones', desc: 'Cobra el 100% a tus miembros' },
          { icon: '🔄', title: 'Cancela cuando quieras', desc: 'Sin permanencia ni penalidades' },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/8">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-white text-sm font-medium">{item.title}</div>
              <div className="text-white/40 text-xs">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ mini */}
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-white/40 text-sm">
          ¿Tienes dudas?{' '}
          <a href="mailto:hola@komunio.app" className="text-violet-400 hover:text-violet-300 underline">
            Escríbenos
          </a>
          {' '}o visita nuestras{' '}
          <a href="#faq" className="text-violet-400 hover:text-violet-300 underline">
            preguntas frecuentes
          </a>
        </p>
      </div>
    </div>
  )
}
