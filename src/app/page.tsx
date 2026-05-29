'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { KomunioLogo } from '@/components/KomunioLogo'
import { Check, ArrowRight, Zap, Users, BookOpen, Trophy, Star, ChevronDown } from 'lucide-react'

const FEATURES = [
  { emoji: '👥', title: 'Comunidades privadas', desc: 'Crea tu espacio exclusivo. Foro, chat, eventos y anuncios — todo en un solo lugar.' },
  { emoji: '📚', title: 'Cursos integrados', desc: 'Sube tus lecciones en video. Tus miembros aprenden dentro de la misma comunidad.' },
  { emoji: '💰', title: 'Cobros con PayPal', desc: 'Acepta pagos desde cualquier país de LATAM. Sin complicaciones bancarias.' },
  { emoji: '🎮', title: 'Gamificación', desc: 'XP, niveles, badges y leaderboard. Tus miembros se mantienen activos y enganchados.' },
  { emoji: '🤖', title: 'Tutor IA incluido', desc: 'Cada comunidad tiene su propio asistente IA entrenado con tu contenido.' },
  { emoji: '🎓', title: 'Certificados automáticos', desc: 'Al completar un curso, tus estudiantes reciben un certificado descargable con tu marca.' },
  { emoji: '📈', title: 'Analytics en tiempo real', desc: 'Ve cómo crece tu comunidad: nuevos miembros, posts populares, retención.' },
  { emoji: '📱', title: 'Mobile-first', desc: 'Funciona perfecto en el celular. Tus miembros siempre conectados desde donde estén.' },
]

const PLANS = [
  { id: 'starter', name: 'Starter', price: 39, annual: 374, color: '#3B82F6', members: '100 miembros', features: ['1 comunidad activa', 'Cursos ilimitados', 'Foro con canales', 'Eventos en vivo', 'Certificados automáticos', 'Analytics básico', 'Soporte por email'] },
  { id: 'creator', name: 'Creator', price: 79, annual: 758, color: '#6C47FF', members: '1,000 miembros', popular: true, features: ['Todo lo de Starter', 'Hasta 1,000 miembros', 'Programa de afiliados', 'Analytics avanzado', 'Notificaciones WhatsApp', 'Badge verificado', 'Soporte prioritario'] },
  { id: 'pro', name: 'Pro', price: 129, annual: 1238, color: '#10B981', members: 'Sin límite', features: ['Todo lo de Creator', 'Miembros ilimitados', 'White-label (próximo)', 'API pública (próximo)', 'Manager dedicado', 'Onboarding personalizado'] },
]

const FAQS = [
  { q: '¿Necesito saber programar?', a: 'Para nada. Komunio lo configuras todo desde un panel visual. En menos de 10 minutos tienes tu comunidad lista para recibir miembros.' },
  { q: '¿Cómo recibo mis pagos?', a: 'Los pagos van directo a tu cuenta de PayPal. Komunio cobra una comisión del 1.5% por transacción — la más baja del mercado.' },
  { q: '¿Puedo migrar desde Skool o Kajabi?', a: 'Sí. Puedes exportar tu lista de miembros e importarla en Komunio. Para los cursos, te ayudamos con la migración.' },
  { q: '¿Hay contrato de permanencia?', a: 'No. Pagas mes a mes y cancelas cuando quieras. Sin penalidades, sin letra chica.' },
  { q: '¿Qué diferencia a Komunio de Skool?', a: 'Komunio está hecho para LATAM: pagos con PayPal, soporte en español, precios en dólares asequibles y sin las restricciones de Skool para creadores de habla hispana.' },
]

export default function LandingPage() {
  const [user, setUser] = useState<any>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Track affiliate ref
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('komunio_ref', ref)
      fetch('/api/affiliates/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: ref }) }).catch(() => {})
    }

    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F0F0F' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F0F0F5', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <KomunioLogo size={32} variant="full" theme="light" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/explorar" style={{ padding: '7px 14px', borderRadius: 8, color: '#525252', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              Explorar comunidades
            </Link>
            <Link href="/precios" style={{ padding: '7px 14px', borderRadius: 8, color: '#525252', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              Precios
            </Link>
            {user ? (
              <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: 9, background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Mi dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ padding: '8px 14px', borderRadius: 9, color: '#525252', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                  Entrar
                </Link>
                <Link href="/registro" style={{ padding: '8px 18px', borderRadius: 9, background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 2px 12px rgba(108,71,255,0.3)' }}>
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(60px,10vw,120px) 24px clamp(60px,8vw,100px)', textAlign: 'center', background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,71,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.2)', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C47FF' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6C47FF' }}>El Skool de LATAM — Ya disponible</span>
          </div>

          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,7vw,72px)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20, color: '#0F0F0F' }}>
            Tu comunidad.<br />
            <span style={{ color: '#6C47FF' }}>Tus ingresos.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: '#525252', lineHeight: 1.6, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Crea tu comunidad online, vende cursos y cobra membresías en español. Con PayPal. Para creadores de LATAM.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, background: '#6C47FF', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 20px rgba(108,71,255,0.35)', transition: 'all .2s' }}>
              Crear mi comunidad <ArrowRight size={17} />
            </Link>
            <Link href="/explorar" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, border: '1.5px solid #E5E5EA', background: '#fff', color: '#0F0F0F', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16 }}>
              Ver comunidades
            </Link>
          </div>

          <p style={{ fontSize: 13, color: '#A0A0AB', marginTop: 16 }}>Planes desde $39/mes · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div style={{ background: '#F7F7F8', borderTop: '1px solid #F0F0F5', borderBottom: '1px solid #F0F0F5', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px,5vw,60px)', flexWrap: 'wrap' }}>
          {[
            { val: '1.5%', label: 'Comisión por transacción' },
            { val: 'PayPal', label: 'Pagos seguros' },
            { val: '100%', label: 'En español' },
            { val: '24/7', label: 'Soporte incluido' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 20, color: '#6C47FF', letterSpacing: '-0.03em' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6C47FF', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Todo lo que necesitas</p>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(26px,5vw,42px)', letterSpacing: '-0.03em', marginBottom: 12, color: '#0F0F0F' }}>
            Una plataforma. Todo incluido.
          </h2>
          <p style={{ fontSize: 16, color: '#525252', maxWidth: 500, margin: '0 auto' }}>
            No necesitas 5 herramientas distintas. Komunio tiene todo lo que un creador necesita para crecer.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: '#FAFAFA', border: '1px solid #F0F0F5', borderRadius: 16, padding: '22px 20px', transition: 'all .2s' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.emoji}</div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#0F0F0F' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VS SKOOL ── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) 24px', background: '#FAFAFA', borderTop: '1px solid #F0F0F5', borderBottom: '1px solid #F0F0F5' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,4vw,34px)', letterSpacing: '-0.03em', color: '#0F0F0F', marginBottom: 8 }}>
              ¿Por qué Komunio y no Skool?
            </h2>
            <p style={{ fontSize: 15, color: '#737373' }}>Skool está hecho para el mercado anglosajón. Komunio está hecho para ti.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Skool', items: ['Solo acepta tarjetas de crédito USA/UK', 'Interfaz en inglés', '$99/mes sin importar tu tamaño', 'Soporte solo en inglés', 'Sin PayPal ni transferencias LATAM', 'Comisión del 2.9% + $0.30 por transacción'], bad: true },
              { title: 'Komunio', items: ['PayPal y métodos de pago LATAM', 'Todo en español', 'Planes desde $39/mes', 'Soporte en español 24/7', 'Optimizado para creadores de LATAM', 'Solo 1.5% de comisión'], bad: false },
            ].map(col => (
              <div key={col.title} style={{ background: col.bad ? '#fff' : 'linear-gradient(135deg, rgba(108,71,255,0.05), rgba(108,71,255,0.02))', border: `1.5px solid ${col.bad ? '#F0F0F5' : 'rgba(108,71,255,0.2)'}`, borderRadius: 16, padding: '20px 18px' }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 14, color: col.bad ? '#737373' : '#6C47FF' }}>{col.title}</h3>
                {col.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>{col.bad ? '✗' : '✓'}</span>
                    <span style={{ fontSize: 13, color: col.bad ? '#A0A0AB' : '#0F0F0F', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', maxWidth: 1000, margin: '0 auto' }} id="precios">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6C47FF', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Precios</p>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(26px,5vw,42px)', letterSpacing: '-0.03em', marginBottom: 12, color: '#0F0F0F' }}>
            Transparente. Sin sorpresas.
          </h2>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: '#F7F7F8', borderRadius: 10, padding: 3, border: '1px solid #E5E5EA', marginTop: 8 }}>
            {[{ val: 'monthly', label: 'Mensual' }, { val: 'annual', label: 'Anual  -20%' }].map(b => (
              <button key={b.val} onClick={() => setBilling(b.val as any)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: billing === b.val ? '#fff' : 'transparent', color: billing === b.val ? '#0F0F0F' : '#737373', boxShadow: billing === b.val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: plan.popular ? 'linear-gradient(135deg, #6C47FF, #8B6DFF)' : '#FAFAFA', border: `1.5px solid ${plan.popular ? 'transparent' : '#E5E5EA'}`, borderRadius: 20, padding: '28px 24px', position: 'relative', boxShadow: plan.popular ? '0 8px 32px rgba(108,71,255,0.25)' : 'none' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  ⭐ Más popular
                </div>
              )}
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 4, color: plan.popular ? '#fff' : '#0F0F0F' }}>{plan.name}</h3>
              <p style={{ fontSize: 12, color: plan.popular ? 'rgba(255,255,255,0.7)' : '#737373', marginBottom: 16 }}>{plan.members}</p>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', color: plan.popular ? '#fff' : '#0F0F0F' }}>
                  ${billing === 'monthly' ? plan.price : Math.round(plan.annual / 12)}
                </span>
                <span style={{ fontSize: 14, color: plan.popular ? 'rgba(255,255,255,0.7)' : '#737373', marginLeft: 4 }}>/mes</span>
                {billing === 'annual' && <div style={{ fontSize: 11, color: plan.popular ? 'rgba(255,255,255,0.8)' : '#10B981', marginTop: 2, fontWeight: 600 }}>Facturado ${plan.annual}/año</div>}
              </div>
              <Link href="/registro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 20px', borderRadius: 10, background: plan.popular ? '#fff' : '#6C47FF', color: plan.popular ? '#6C47FF' : '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 20 }}>
                Empezar con {plan.name} →
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={14} color={plan.popular ? 'rgba(255,255,255,0.8)' : '#6C47FF'} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.9)' : '#525252' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#A0A0AB', marginTop: 20 }}>
          + 1.5% de comisión por transacción · Sin cargos ocultos · Cancela cuando quieras
        </p>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) 24px', background: '#FAFAFA', borderTop: '1px solid #F0F0F5' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,4vw,34px)', letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 36, color: '#0F0F0F' }}>
            Preguntas frecuentes
          </h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #E5E5EA', paddingBottom: 0 }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0F0F0F' }}>{faq.q}</span>
                <ChevronDown size={18} color="#737373" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {openFaq === i && (
                <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.7, margin: '0 0 18px', paddingBottom: 0 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,5vw,46px)', letterSpacing: '-0.04em', marginBottom: 14, color: '#0F0F0F' }}>
            Empieza hoy.<br /><span style={{ color: '#6C47FF' }}>Gratis.</span>
          </h2>
          <p style={{ fontSize: 16, color: '#525252', marginBottom: 28, lineHeight: 1.6 }}>
            Crea tu cuenta gratis. Tu comunidad desde $39/mes.
          </p>
          <Link href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', borderRadius: 14, background: '#6C47FF', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, boxShadow: '0 8px 28px rgba(108,71,255,0.35)' }}>
            Crear mi comunidad <ArrowRight size={18} />
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
            {['Planes desde $39/mes', 'Cancela cuando quieras', 'Soporte en español'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#737373' }}>
                <Check size={13} color="#10B981" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#F7F7F8', borderTop: '1px solid #E5E5EA', padding: '24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <KomunioLogo size={24} variant="full" theme="light" />
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[['Explorar', '/explorar'], ['Precios', '/precios'], ['Términos', '/terminos'], ['Privacidad', '/privacidad']].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: 13, color: '#737373', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#A0A0AB', margin: 0 }}>© 2026 Komunio · Hecho con ❤️ para LATAM</p>
        </div>
      </footer>
    </div>
  )
}
