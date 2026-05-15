'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Star, Zap, ChevronRight, Menu, X } from 'lucide-react'

const C = {
  bg: '#1F2335', bg1: '#262B42', bg2: '#2D3452',
  border: 'rgba(255,255,255,0.08)',
  text: '#E8E9F0', muted: '#7B7FA8', muted2: '#A8AACC',
  purple: '#6366F1', purple2: '#818CF8',
  green: '#00D68F', gold: '#F0A500', red: '#FF4D6A',
}

const NAV_LINKS = [
  { label: 'Características', href: '#features' },
  { label: 'vs Skool', href: '#comparacion' },
  { label: 'Precios', href: '#precios' },
]

const FEATURES = [
  { icon: '🌐', title: 'Comunidades de pago', desc: 'Lanza y monetiza desde el día 1. Tú defines el precio, cobras directo por PayPal.' },
  { icon: '🎓', title: 'Cursos con video', desc: 'Módulos con YouTube, recursos y certificados automáticos al completar.' },
  { icon: '💬', title: 'Foro activo', desc: 'Canales organizados, posts, comentarios y likes. Tu audiencia siempre conectada.' },
  { icon: '🏆', title: 'Gamificación real', desc: 'XP, niveles, rachas diarias y leaderboard. Tus miembros vuelven solos.' },
  { icon: '📅', title: 'Eventos en vivo', desc: 'Webinars y Q&As con Zoom o Meet, directamente en la plataforma.' },
  { icon: '🤝', title: 'Programa de afiliados', desc: 'Tus miembros te consiguen más miembros. Comisiones automáticas.' },
]

const COMPARISON = [
  { feature: 'Idioma', ec: 'Español + Portugués', sk: 'Solo inglés' },
  { feature: 'Pagos', ec: 'PayPal (LATAM nativo)', sk: 'Solo tarjeta USD' },
  { feature: 'Precio', ec: 'Desde $39/mes', sk: '$99/mes' },
  { feature: 'Comunidades', ec: 'Hasta ilimitadas', sk: 'Solo 1' },
  { feature: 'Afiliados', ec: '✓ Incluido', sk: '✗ No' },
  { feature: 'Certificados', ec: '✓ Automáticos', sk: '✗ No' },
  { feature: 'Soporte', ec: 'Español 24/7', sk: 'Solo inglés' },
]

const PLANS = [
  {
    id: 'starter', name: 'Starter', emoji: '🚀',
    monthly: 39, annual: 374,
    features: ['1 comunidad', 'Hasta 100 miembros', 'Cursos ilimitados', 'Foro + canales', 'Certificados', 'Analytics'],
    highlighted: false,
  },
  {
    id: 'creator', name: 'Creator', emoji: '⚡',
    monthly: 79, annual: 758,
    features: ['2 comunidades', 'Hasta 1,000 miembros', 'Todo de Starter', 'Afiliados nativos', 'Eventos en vivo', 'Soporte prioritario'],
    highlighted: true,
  },
  {
    id: 'pro', name: 'Pro', emoji: '👑',
    monthly: 129, annual: 1238,
    features: ['5 comunidades', 'Miembros ilimitados', 'Todo de Creator', 'Badge verificado', 'API access', 'Manager dedicado'],
    highlighted: false,
  },
]

const TESTIMONIALS = [
  { name: 'Carlos R.', country: '🇨🇴', role: 'Creador de contenido', text: 'En 3 meses construí una comunidad de 400 emprendedores que me genera $3,800 al mes.', mrr: '$3,800', color: C.purple },
  { name: 'Ana S.', country: '🇧🇷', role: 'Coach de negocios', text: 'Finalmente una plataforma en español Y portugués. Mis estudiantes adoran la experiencia.', mrr: '$2,100', color: C.green },
  { name: 'Miguel T.', country: '🇲🇽', role: 'Consultor de marketing', text: 'Migré desde Skool y mis conversiones subieron 40%. PayPal fue el factor clave.', mrr: '$5,200', color: C.gold },
]

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(31,35,53,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, padding: '0 20px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${C.purple}44` }}>
              <Zap size={17} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 18, color: C.text, letterSpacing: '-0.03em' }}>EscalaClub</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{ color: C.muted2, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{l.label}</a>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Desktop only */}
            <Link href="/login" style={{ color: C.muted2, fontSize: 14, fontWeight: 500, textDecoration: 'none' }} className="hidden md:block">
              Entrar
            </Link>
            <Link href="/registro" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }} className="hidden md:flex">
              Comenzar gratis
            </Link>
            {/* Mobile: show registro button + hamburger */}
            <Link href="/registro" style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderRadius: 10, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }} className="md:hidden">
              Registrarme
            </Link>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, cursor: 'pointer', padding: '8px', display: 'flex' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, padding: '16px 20px 24px' }}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '13px 0', color: C.muted2, fontSize: 15, textDecoration: 'none', borderBottom: `1px solid ${C.border}` }}>
                {l.label}
              </a>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <Link href="/login" style={{ padding: '12px', textAlign: 'center', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted2, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Entrar</Link>
              <Link href="/registro" style={{ padding: '12px', textAlign: 'center', background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, borderRadius: 10, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Registrarme</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(100px, 15vw, 140px) 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 'min(500px, 100vw)', height: 'min(500px, 100vw)', background: `radial-gradient(circle, ${C.purple}18 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: `rgba(99,102,241,0.1)`, border: `1px solid rgba(99,102,241,0.25)`, marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'block' }} className="animate-pulse" />
            <span style={{ fontSize: 12, color: C.purple2, fontWeight: 600 }}>El Skool de LATAM — Ahora en vivo</span>
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(38px, 8vw, 80px)', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 20 }}>
            Tu comunidad.<br />
            <span style={{ background: `linear-gradient(135deg, ${C.purple2}, ${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Tu ingreso.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 3vw, 18px)', color: C.muted2, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Crea comunidades, vende cursos y cobra membresías en español. Sin comisiones. Con PayPal. Para LATAM.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, boxShadow: `0 0 40px ${C.purple}44` }}>
              Crear mi comunidad gratis <ArrowRight size={17} />
            </Link>
            <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.muted2, textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 5vw, 48px)', flexWrap: 'wrap' }}>
            {[['10K+','Miembros activos'],['$2.4M','Generados'],['200+','Comunidades'],['15','Países']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(20px, 4vw, 28px)', color: C.text }}>{n}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', background: 'rgba(255,255,255,0.02)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 40px)', flexWrap: 'wrap', minWidth: 'max-content', margin: '0 auto' }}>
          {['✅ Sin comisiones','💳 PayPal nativo','🌎 Español + Portugués','⚡ Setup en 10 min'].map(t => (
            <span key={t} style={{ fontSize: 13, color: C.muted2, fontWeight: 500, whiteSpace: 'nowrap' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: 'clamp(60px, 8vw, 96px) 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.04em', marginBottom: 12 }}>
              Todo lo que necesitas.<br />
              <span style={{ color: C.muted }}>En una sola plataforma.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 'clamp(20px, 4vw, 28px)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 8, color: C.text }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ── */}
      <section id="comparacion" style={{ padding: 'clamp(60px, 8vw, 96px) 20px', background: 'rgba(255,255,255,0.01)', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.04em', marginBottom: 10 }}>EscalaClub vs Skool</h2>
            <p style={{ color: C.muted, fontSize: 16 }}>Skool es para USA. EscalaClub es para nosotros.</p>
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 400, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.bg1 }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: C.muted, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>Característica</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, color: C.text, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>⚡ EscalaClub</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, color: C.muted, fontWeight: 600 }}>Skool</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted2 }}>{row.feature}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.green, fontWeight: 600 }}>
                        <Check size={12} /> {row.ec}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: C.muted }}>{row.sk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(60px, 8vw, 96px) 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.04em', marginBottom: 10 }}>Creadores que ya escalan</h2>
            <p style={{ color: C.muted, fontSize: 16 }}>Resultados reales en LATAM.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[...Array(5)].map((_,j) => <Star key={j} size={13} color={C.gold} fill={C.gold} />)}
                </div>
                <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.65, flex: 1, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.color + '25', border: `2px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: t.color, flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{t.name} {t.country}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{t.role}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.green }}>{t.mrr}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>al mes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" style={{ padding: 'clamp(60px, 8vw, 96px) 20px', background: 'rgba(255,255,255,0.01)', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.04em', marginBottom: 10 }}>Precios simples</h2>
            <p style={{ color: C.muted, fontSize: 16, marginBottom: 24 }}>Sin sorpresas. Sin comisiones. Cancela cuando quieras.</p>
            <div style={{ display: 'inline-flex', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
              {(['monthly','annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: '8px 18px', borderRadius: 9, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  background: billing === b ? `linear-gradient(135deg, ${C.purple}, ${C.purple2})` : 'transparent',
                  color: billing === b ? '#fff' : C.muted, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {b === 'monthly' ? 'Mensual' : 'Anual'}
                  {b === 'annual' && <span style={{ fontSize: 9, background: 'rgba(0,214,143,0.15)', color: C.green, padding: '2px 6px', borderRadius: 99 }}>-20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 16, alignItems: 'start' }}>
            {PLANS.map(plan => {
              const price = billing === 'monthly' ? plan.monthly : Math.round(plan.annual / 12)
              const savings = plan.monthly * 12 - plan.annual
              return (
                <div key={plan.id} style={{
                  background: plan.highlighted ? `rgba(99,102,241,0.06)` : C.bg1,
                  border: `1px solid ${plan.highlighted ? 'rgba(99,102,241,0.4)' : C.border}`,
                  borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)',
                  position: 'relative',
                }}>
                  {plan.highlighted && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, color: '#fff', fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                      ⭐ MÁS POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{plan.emoji}</div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 20, marginBottom: 16, color: C.text }}>{plan.name}</h3>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px, 6vw, 44px)', color: C.text }}>${price}</span>
                    <span style={{ fontSize: 13, color: C.muted }}>/mes</span>
                    {billing === 'annual' && <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>Ahorras ${savings}/año</div>}
                  </div>
                  <ul style={{ marginBottom: 24, listStyle: 'none', padding: 0 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, fontSize: 13, color: C.muted2 }}>
                        <Check size={13} color={C.green} strokeWidth={2.5} style={{ flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/registro" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '13px 20px', borderRadius: 12, textDecoration: 'none',
                    background: plan.highlighted ? `linear-gradient(135deg, ${C.purple}, ${C.purple2})` : 'rgba(255,255,255,0.06)',
                    color: plan.highlighted ? '#fff' : C.muted2,
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
                    border: plan.highlighted ? 'none' : `1px solid ${C.border}`,
                    boxSizing: 'border-box',
                  }}>
                    Elegir {plan.name} <ChevronRight size={15} />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: 12, marginTop: 28 }}>
            {[['🔒','Sin comisiones','100% de tus ingresos son tuyos'],['💳','PayPal seguro','Protección al comprador'],['🔄','Cancela cuando quieras','Sin contratos ni penalidades']].map(([ic,t,d]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{ic}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'Syne, sans-serif' }}>{t}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: 'clamp(60px, 8vw, 96px) 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${C.purple}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px, 7vw, 64px)', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.05 }}>
            Empieza a escalar<br />
            <span style={{ background: `linear-gradient(135deg, ${C.purple2}, ${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>desde hoy</span>
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
            Únete a los creadores que ya monetizan en LATAM. Sin tarjeta de crédito.
          </p>
          <Link href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 14, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, boxShadow: `0 0 60px ${C.purple}44` }}>
            Crear mi comunidad gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>EscalaClub</span>
          </Link>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>{l.label}</a>
            ))}
            <Link href="/terminos" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Términos</Link>
            <Link href="/privacidad" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Privacidad</Link>
            <Link href="/login" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Entrar</Link>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>© 2026 EscalaClub · SCALON · Panamá 🇵🇦</div>
        </div>
      </footer>
    </div>
  )
}
