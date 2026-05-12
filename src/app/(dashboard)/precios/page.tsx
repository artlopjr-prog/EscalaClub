'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Zap } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

const PLANS = [
  {
    id: 'starter', name: 'Starter', emoji: '🚀',
    desc: 'Para empezar tu primera comunidad',
    monthly: 39, annual: 374,
    color: '#3B82F6',
    features: ['1 comunidad activa','Hasta 100 miembros','Cursos ilimitados','Foro con canales','Certificados automáticos','Analytics básico','Soporte por email'],
  },
  {
    id: 'creator', name: 'Creator', emoji: '⚡',
    desc: 'Para creadores en crecimiento serio',
    monthly: 79, annual: 758,
    color: '#7C3AED', popular: true,
    features: ['1 comunidad activa','Hasta 1,000 miembros','Todo lo de Starter','Programa de afiliados','Eventos en vivo (Zoom/Meet)','Analytics avanzado','WhatsApp notifications','Soporte prioritario'],
  },
  {
    id: 'pro', name: 'Pro', emoji: '👑',
    desc: 'Para negocios educativos a escala',
    monthly: 129, annual: 1238,
    color: '#F0A500',
    features: ['Comunidades ilimitadas','Miembros ilimitados','Todo lo de Creator','Badge verificado','API access','Manager dedicado','White-label (próximamente)','SLA garantizado'],
  },
]

export default function PreciosPage() {
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly')

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '32px 24px 60px' }}>
      {/* Back button */}
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 13, marginBottom: 40 }}>
        <ArrowLeft size={14} /> Volver al dashboard
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.text }}>Elige tu plan de creador</span>
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 42, letterSpacing: '-0.04em', color: C.text, marginBottom: 12, lineHeight: 1.1 }}>
          Construye tu<br />
          <span style={{ background: 'linear-gradient(135deg, #9F67FF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>comunidad ideal</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: '0 auto 32px' }}>
          Sin comisiones por venta. Sin límites de contenido. Tú cobras directo a tus miembros.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {[{ val: 'monthly', label: 'Mensual' }, { val: 'annual', label: 'Anual' }].map(opt => (
            <button key={opt.val} onClick={() => setBilling(opt.val as any)} style={{
              padding: '8px 24px', borderRadius: 9, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700,
              background: billing === opt.val ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'transparent',
              color: billing === opt.val ? '#fff' : C.muted, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {opt.label}
              {opt.val === 'annual' && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(0,214,143,0.2)', color: C.green, padding: '1px 6px', borderRadius: 99 }}>-20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto 48px' }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background: plan.popular ? `linear-gradient(145deg, ${plan.color}18, ${C.bg1})` : C.bg1,
            border: `2px solid ${plan.popular ? plan.color + '60' : C.border}`,
            borderRadius: 24, padding: 28, position: 'relative', display: 'flex', flexDirection: 'column',
            boxShadow: plan.popular ? `0 0 40px ${plan.color}20` : 'none',
          }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 99, background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: '#fff', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 800, whiteSpace: 'nowrap' }}>
                MÁS POPULAR
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{plan.emoji}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: C.text, marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{plan.desc}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', color: plan.color }}>
                  ${billing === 'monthly' ? plan.monthly : Math.round(plan.annual / 12)}
                </span>
                <span style={{ fontSize: 14, color: C.muted }}>/mes</span>
              </div>
              {billing === 'annual' && (
                <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>
                  ${plan.annual}/año · Ahorras ${(plan.monthly * 12) - plan.annual}
                </div>
              )}
            </div>

            <div style={{ flex: 1, marginBottom: 24 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <Check size={15} color={plan.color} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: C.muted2, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` : 'transparent',
              border: plan.popular ? 'none' : `2px solid ${plan.color}`,
              color: plan.popular ? '#fff' : plan.color,
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {plan.id === 'starter' ? 'Empezar gratis 14 días' : `Elegir ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>✅ Sin contratos · Cancela cuando quieras · Pago seguro con PayPal</p>
        <p style={{ fontSize: 13, color: C.muted }}>¿Tienes dudas? <a href="mailto:hola@escalaclub.com" style={{ color: C.purple2, textDecoration: 'none' }}>Contáctanos</a></p>
      </div>
    </div>
  )
}
