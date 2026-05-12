'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Star, Users, Zap, TrendingUp, Play, ChevronRight, Award, MessageSquare, Calendar, DollarSign, Menu, X, Globe, BookOpen } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Características', href: '#features' },
  { label: 'vs Skool', href: '#comparacion' },
  { label: 'Precios', href: '#precios' },
  { label: 'Testimonios', href: '#testimonios' },
]

const FEATURES = [
  { icon: '🌐', title: 'Comunidades de pago', desc: 'Lanza y monetiza tu comunidad desde el día 1. Tú defines el precio, EscalaClub pone la infraestructura.' },
  { icon: '🎓', title: 'Cursos con video', desc: 'Módulos con YouTube, recursos descargables y certificados automáticos al completar cada curso.' },
  { icon: '💬', title: 'Foro por comunidad', desc: 'Canales organizados por tema. Posts, comentarios y likes. Tu audiencia siempre activa.' },
  { icon: '🏆', title: 'Gamificación real', desc: 'XP, niveles, rachas diarias y leaderboard. Tus miembros vuelven cada día sin que tengas que insistir.' },
  { icon: '📅', title: 'Eventos en vivo', desc: 'Webinars y Q&As con Zoom o Meet, directamente en la plataforma. Tus miembros no salen.' },
  { icon: '🤝', title: 'Programa de afiliados', desc: 'Tus propios miembros te consiguen más miembros. Comisiones automáticas vía PayPal.' },
]

const COMPARISON = [
  { feature: 'Idioma de la plataforma', ec: 'Español + Portugués', sk: 'Solo inglés' },
  { feature: 'Método de pago', ec: 'PayPal (LATAM nativo)', sk: 'Solo tarjeta USD' },
  { feature: 'Precio para creadores', ec: 'Desde $39/mes', sk: '$99/mes único' },
  { feature: 'Comunidades por cuenta', ec: 'Hasta ilimitadas (Pro)', sk: 'Solo 1' },
  { feature: 'Programa de afiliados', ec: '✓ Incluido', sk: '✗ No disponible' },
  { feature: 'Certificados digitales', ec: '✓ Automáticos', sk: '✗ No disponible' },
  { feature: 'Soporte', ec: 'Español 24/7', sk: 'Solo inglés' },
]

const PLANS = [
  {
    id: 'starter', name: 'Starter', emoji: '🚀',
    desc: 'Para arrancar tu primera comunidad',
    monthly: 39, annual: 374,
    features: ['1 comunidad', 'Hasta 100 miembros', 'Cursos ilimitados', 'Foro + canales', 'Certificados', 'Analytics básico'],
    cta: 'Empezar gratis', highlighted: false,
  },
  {
    id: 'creator', name: 'Creator', emoji: '⚡',
    desc: 'Para creadores que van en serio',
    monthly: 79, annual: 758,
    features: ['1 comunidad', 'Hasta 1,000 miembros', 'Todo de Starter', 'Afiliados nativos', 'Eventos en vivo', 'Analytics avanzado', 'Soporte prioritario'],
    cta: 'Elegir Creator', highlighted: true,
  },
  {
    id: 'pro', name: 'Pro', emoji: '👑',
    desc: 'Para negocios educativos a escala',
    monthly: 129, annual: 1238,
    features: ['Comunidades ilimitadas', 'Miembros ilimitados', 'Todo de Creator', 'Badge verificado', 'API access', 'Manager dedicado'],
    cta: 'Elegir Pro', highlighted: false,
  },
]

const TESTIMONIALS = [
  { name: 'Carlos Rodríguez', country: '🇨🇴 Colombia', role: 'Creador de contenido', text: 'En 3 meses construí una comunidad de 400 emprendedores que me genera $3,800 al mes. EscalaClub cambió mi negocio.', initials: 'CR', mrr: '$3,800', color: '#7C3AED' },
  { name: 'Ana Souza', country: '🇧🇷 Brasil', role: 'Coach de negocios', text: 'Finalmente una plataforma en español Y portugués. Mis estudiantes adoran la experiencia y yo adoro el soporte.', initials: 'AS', mrr: '$2,100', color: '#00D68F' },
  { name: 'Miguel Torres', country: '🇲🇽 México', role: 'Consultor de marketing', text: 'Migré desde Skool y mis conversiones subieron 40%. PayPal fue el factor clave para mi audiencia en LATAM.', initials: 'MT', mrr: '$5,200', color: '#F0A500' },
]

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(6,6,10,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--grad-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(124,58,237,0.4)',
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 20, letterSpacing: '-0.04em' }}>
              EscalaClub
            </span>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{ color: 'var(--muted2)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted2)')}>
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ color: 'var(--muted2)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }} className="hidden sm:block">
              Entrar
            </Link>
            <Link href="/registro" className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
              Comenzar gratis <ArrowRight size={15} />
            </Link>
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4 }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: 'var(--bg1)', borderTop: '1px solid var(--border)', padding: '16px 24px 24px' }}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '12px 0', color: 'var(--muted2)', fontSize: 15, textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                {l.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link href="/login" style={{ flex: 1, padding: '11px', textAlign: 'center', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--muted2)', textDecoration: 'none', fontSize: 14 }}>Entrar</Link>
              <Link href="/registro" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>Registrarme</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '140px 24px 80px', overflow: 'hidden' }}>
        {/* Mesh background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'var(--grad-mesh)',
          pointerEvents: 'none',
        }} />
        {/* Purple orb */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'block' }} className="animate-pulse" />
            <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 600, fontFamily: 'Cabinet Grotesk' }}>
              El Skool de LATAM — Ahora en vivo
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontFamily: 'Cabinet Grotesk', fontWeight: 900,
            fontSize: 'clamp(48px, 7vw, 88px)', lineHeight: 1.0,
            letterSpacing: '-0.04em', marginBottom: 24,
          }}>
            Tu comunidad.<br />
            <span className="text-gradient">Tu ingreso.</span><br />
            <span style={{ color: 'var(--muted2)' }}>Tu plataforma.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--muted2)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Crea comunidades, vende cursos y cobra membresías recurrentes en español y portugués.
            Sin comisiones. Con PayPal. Para LATAM.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/registro" className="btn-primary" style={{ padding: '14px 28px', fontSize: 16, boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
              Crear mi comunidad gratis
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 16 }}>
              <Play size={16} />
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 4vw, 56px)', flexWrap: 'wrap' }}>
            {[
              { n: '10K+', l: 'Miembros activos' },
              { n: '$2.4M', l: 'Generados por creadores' },
              { n: '200+', l: 'Comunidades' },
              { n: '15', l: 'Países LATAM' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 28, letterSpacing: '-0.04em' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ maxWidth: 1100, margin: '64px auto 0', position: 'relative', zIndex: 1 }}>
          {/* Fade bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, transparent, var(--bg))', zIndex: 2, pointerEvents: 'none' }} />
          
          <div style={{
            background: 'var(--bg1)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            {/* Browser chrome */}
            <div style={{ background: 'var(--bg2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.8 }} />)}
              </div>
              <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 7, padding: '5px 12px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                escalaclub.com/dashboard
              </div>
            </div>
            {/* Mock dashboard content */}
            <div style={{ display: 'flex' }}>
              {/* Sidebar */}
              <div style={{ width: 220, background: 'var(--bg1)', borderRight: '1px solid var(--border)', padding: '20px 12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 20 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={14} color="#fff" />
                  </div>
                  <span style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 14 }}>EscalaClub</span>
                </div>
                {[
                  { icon: '⚡', label: 'Dashboard', active: true },
                  { icon: '🌐', label: 'Comunidades' },
                  { icon: '📚', label: 'Cursos' },
                  { icon: '💬', label: 'Foro' },
                  { icon: '🏆', label: 'Leaderboard' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 9, marginBottom: 2,
                    background: item.active ? 'rgba(124,58,237,0.12)' : 'transparent',
                    color: item.active ? '#A78BFA' : 'var(--muted)',
                    fontSize: 13, fontWeight: 500,
                  }}>
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Buenos días, Carlos 👋</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Martes, 7 mayo · 🔥 21 días seguidos</div>
                </div>
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Miembros', value: '847', change: '+24', color: '#7C3AED', emoji: '👥' },
                    { label: 'MRR', value: '$3,200', change: '+18%', color: '#00D68F', emoji: '💰' },
                    { label: 'Cursos', value: '6', change: '2 activos', color: '#F0A500', emoji: '📚' },
                    { label: 'Tu nivel', value: 'Nv. 7', change: '3,240 XP', color: '#9F67FF', emoji: '⭐' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px' }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{s.emoji}</div>
                      <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 20, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 4 }}>↑ {s.change}</div>
                    </div>
                  ))}
                </div>
                {/* Course progress */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Cursos en progreso</div>
                  {[
                    { title: 'Marketing con IA', pct: 78, color: '#7C3AED' },
                    { title: 'Ventas B2B Modernas', pct: 45, color: '#00D68F' },
                    { title: 'Automatización n8n', pct: 22, color: '#F0A500' },
                  ].map(c => (
                    <div key={c.title} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{c.title}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Cabinet Grotesk', fontWeight: 700 }}>{c.pct}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                        <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
          {[
            '✅ Sin comisiones por venta',
            '💳 PayPal integrado nativamente',
            '🌎 Español + Portugués',
            '⚡ Setup en menos de 10 minutos',
          ].map(t => (
            <span key={t} style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border2)', marginBottom: 20 }}>
              <Zap size={12} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 600, fontFamily: 'Cabinet Grotesk', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Todo incluido</span>
            </div>
            <h2 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 'clamp(36px,5vw,56px)', letterSpacing: '-0.04em', marginBottom: 16 }}>
              Una plataforma.<br />
              <span style={{ color: 'var(--muted2)' }}>Todo lo que necesitas.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
              No más 5 herramientas distintas. EscalaClub reemplaza todo.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', background: 'var(--border)' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '32px', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 18, marginBottom: 10, letterSpacing: '-0.03em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ── */}
      <section id="comparacion" style={{ padding: '96px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 'clamp(36px,5vw,56px)', letterSpacing: '-0.04em', marginBottom: 16 }}>
              EscalaClub vs Skool
            </h2>
            <p style={{ fontSize: 17, color: 'var(--muted)' }}>
              Skool es para USA. EscalaClub es para nosotros.
            </p>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--bg1)', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Característica</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 15 }}>⚡ EscalaClub</div>
                <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 2 }}>Para LATAM</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 700, fontSize: 15, color: 'var(--muted)' }}>Skool</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Para USA/UK</div>
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '14px 24px', alignItems: 'center',
                borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <div style={{ fontSize: 13, color: 'var(--muted2)' }}>{row.feature}</div>
                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Check size={13} color="var(--green)" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{row.ec}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>{row.sk}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonios" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 'clamp(36px,5vw,56px)', letterSpacing: '-0.04em', marginBottom: 16 }}>
              Creadores que ya escalan
            </h2>
            <p style={{ fontSize: 17, color: 'var(--muted)' }}>Resultados reales. Personas reales en LATAM.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} color="var(--gold)" fill="var(--gold)" />)}
                </div>
                <p style={{ fontSize: 15, color: 'var(--muted2)', lineHeight: 1.65, flex: 1, marginBottom: 24 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.color + '25', border: `2px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 14, color: t.color, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role} · {t.country}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{t.mrr}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>al mes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" style={{ padding: '96px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 'clamp(36px,5vw,56px)', letterSpacing: '-0.04em', marginBottom: 16 }}>
              Precios simples
            </h2>
            <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 32 }}>Sin sorpresas. Sin comisiones por venta. Cancela cuando quieras.</p>
            {/* Toggle */}
            <div style={{ display: 'inline-flex', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
              {(['monthly', 'annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: '8px 20px', borderRadius: 9, fontSize: 14, fontFamily: 'Cabinet Grotesk', fontWeight: 700,
                  background: billing === b ? 'var(--grad-purple)' : 'transparent',
                  color: billing === b ? '#fff' : 'var(--muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {b === 'monthly' ? 'Mensual' : 'Anual'}
                  {b === 'annual' && (
                    <span style={{ fontSize: 10, background: 'rgba(0,214,143,0.15)', color: 'var(--green)', padding: '2px 7px', borderRadius: 99 }}>
                      2 meses gratis
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
            {PLANS.map(plan => {
              const price = billing === 'monthly' ? plan.monthly : Math.round(plan.annual / 12)
              const savings = plan.monthly * 12 - plan.annual
              return (
                <div key={plan.id} style={{
                  background: plan.highlighted ? 'rgba(124,58,237,0.06)' : 'var(--bg1)',
                  border: plan.highlighted ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '32px',
                  position: 'relative',
                  boxShadow: plan.highlighted ? '0 0 50px rgba(124,58,237,0.12)' : 'none',
                }}>
                  {plan.highlighted && (
                    <div style={{
                      position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--grad-purple)', color: '#fff',
                      fontSize: 11, fontFamily: 'Cabinet Grotesk', fontWeight: 800,
                      padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>⭐ Más popular</div>
                  )}
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{plan.emoji}</div>
                  <h3 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 22, marginBottom: 4, letterSpacing: '-0.03em' }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{plan.desc}</p>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 44, letterSpacing: '-0.05em' }}>${price}</span>
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>/mes</span>
                    {billing === 'annual' && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>Ahorras ${savings}/año</div>}
                  </div>
                  <ul style={{ marginBottom: 28, listStyle: 'none' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: 'var(--muted2)' }}>
                        <Check size={14} color="var(--green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/registro" className={plan.highlighted ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center', padding: '13px 24px' }}>
                    {plan.cta} <ChevronRight size={16} />
                  </Link>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 32 }}>
            {[
              { icon: '🔒', t: 'Pago seguro con PayPal', d: 'Protección al comprador incluida' },
              { icon: '❌', t: 'Sin comisiones por venta', d: '100% de tus ingresos son tuyos' },
              { icon: '🔄', t: 'Cancela cuando quieras', d: 'Sin contratos ni penalidades' },
            ].map(b => (
              <div key={b.t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Cabinet Grotesk' }}>{b.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 'clamp(40px,6vw,72px)', letterSpacing: '-0.04em', marginBottom: 20, lineHeight: 1.0 }}>
            Empieza a escalar
            <br /><span className="text-gradient">desde hoy</span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6 }}>
            Únete a los creadores que ya monetizan su conocimiento en LATAM.
            Sin tarjeta de crédito. Gratis 14 días.
          </p>
          <Link href="/registro" className="btn-primary" style={{ padding: '16px 36px', fontSize: 17, boxShadow: '0 0 60px rgba(124,58,237,0.5)' }}>
            Crear mi comunidad gratis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 16 }}>EscalaClub</span>
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>{l.label}</a>
            ))}
            <Link href="/login" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Entrar</Link>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>© 2026 EscalaClub · Panamá 🇵🇦</div>
        </div>
      </footer>
    </div>
  )
}
