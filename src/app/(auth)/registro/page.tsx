'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, User, Globe, ArrowRight, Eye, EyeOff, Users, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const COUNTRIES = ['Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Ecuador','El Salvador','Guatemala','Honduras','México','Nicaragua','Panamá','Paraguay','Perú','Puerto Rico','República Dominicana','Uruguay','Venezuela','Otro']

const C = {
  bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C',
  border: 'rgba(255,255,255,0.07)',
  text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0',
  purple: '#7C3AED', purple2: '#9F67FF',
  green: '#00D68F', gold: '#F0A500',
}

type Role = 'member' | 'creator'

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [role, setRole] = useState<Role>('member')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', country: '', language: 'es' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) { toast.error('Completa todos los campos'); return }
    if (form.password.length < 8) { toast.error('Mínimo 8 caracteres'); return }
    if (!acceptedTerms) { toast.error('Debes aceptar los Términos y Condiciones'); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          country: form.country,
          language: form.language,
          intended_role: role,
        }
      }
    })

    if (error) { toast.error(error.message); setLoading(false); return }

    fetch('/api/emails/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.full_name, email: form.email, role }),
    }).catch(() => {})

    toast.success('¡Cuenta creada! Revisa tu email para confirmar.')

    // Si es creador → precios, si es miembro → onboarding
    if (role === 'creator') {
      router.push('/precios')
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', overflowX: 'hidden', maxWidth: '100vw' }}>
      {/* Left branding */}
      <div style={{ flex: 1, background: C.bg1, borderRight: `1px solid ${C.border}`, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="hidden lg:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.04em', color: C.text }}>EscalaClub</span>
        </div>
        <div>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🚀</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: C.text }}>
            Empieza hoy.<br />
            <span style={{ background: 'linear-gradient(135deg, #9F67FF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sin límites.</span>
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6 }}>
            La plataforma de comunidades y cursos online para LATAM. Crea, conecta y genera ingresos recurrentes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['$0','Costo inicial'],['100%','Tus ingresos'],['LATAM','Tu mercado']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.04em', color: C.text }}>{v}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }} className="lg:hidden">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text }}>EscalaClub</span>
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em', marginBottom: 6, color: C.text }}>Crear cuenta gratis</h1>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
            ¿Ya tienes cuenta? <Link href="/login" style={{ color: C.purple2, textDecoration: 'none', fontWeight: 600 }}>Inicia sesión →</Link>
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted2, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif', marginBottom: 10 }}>Quiero unirme como</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Miembro */}
              <button type="button" onClick={() => setRole('member')} style={{
                padding: '16px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                background: role === 'member' ? 'rgba(124,58,237,0.12)' : C.bg1,
                border: `2px solid ${role === 'member' ? C.purple : C.border}`,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: role === 'member' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Users size={18} color={role === 'member' ? C.purple2 : C.muted} />
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: role === 'member' ? C.text : C.muted, marginBottom: 3 }}>Miembro</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Únete a comunidades y aprende</div>
              </button>

              {/* Creador */}
              <button type="button" onClick={() => setRole('creator')} style={{
                padding: '16px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                background: role === 'creator' ? 'rgba(240,165,0,0.08)' : C.bg1,
                border: `2px solid ${role === 'creator' ? C.gold : C.border}`,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700, background: 'rgba(240,165,0,0.15)', color: C.gold, padding: '2px 7px', borderRadius: 99, fontFamily: 'Syne, sans-serif' }}>PLANES DESDE $39</div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: role === 'creator' ? 'rgba(240,165,0,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Sparkles size={18} color={role === 'creator' ? C.gold : C.muted} />
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: role === 'creator' ? C.text : C.muted, marginBottom: 3 }}>Creador</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Crea tu comunidad y cobra</div>
              </button>
            </div>
            {role === 'creator' && (
              <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(240,165,0,0.06)', border: `1px solid rgba(240,165,0,0.15)`, fontSize: 12, color: C.gold, lineHeight: 1.5 }}>
                💡 Después de registrarte te mostraremos los planes disponibles. Empieza gratis y elige cuando estés listo.
              </div>
            )}
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Language */}
            <div style={{ display: 'flex', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
              {[['es','🇪🇸 Español'],['pt','🇧🇷 Português']].map(([lang, label]) => (
                <button key={lang} type="button" onClick={() => set('language', lang)} style={{
                  flex: 1, padding: '7px', borderRadius: 9, fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  background: form.language === lang ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'transparent',
                  color: form.language === lang ? '#fff' : C.muted,
                  border: 'none', cursor: 'pointer',
                }}>{label}</button>
              ))}
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted2, marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {form.language === 'es' ? 'Nombre completo' : 'Nome completo'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Juan García" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted2, marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="tu@email.com" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted2, marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {form.language === 'es' ? 'Contraseña' : 'Senha'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Mín. 8 caracteres" className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Country */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted2, marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>País</label>
              <div style={{ position: 'relative' }}>
                <Globe size={15} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select value={form.country} onChange={e => set('country', e.target.value)} className="input" style={{ paddingLeft: 40, cursor: 'pointer' }}>
                  <option value="">{form.language === 'es' ? 'Selecciona tu país' : 'Selecione seu país'}</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }} />
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${acceptedTerms ? C.purple : C.border}`, background: acceptedTerms ? C.purple : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {acceptedTerms && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
              <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                He leído y acepto los{' '}
                <Link href="/terminos" target="_blank" style={{ color: C.purple2, textDecoration: 'none', fontWeight: 600 }}>Términos y Condiciones</Link>
                {' '}y la{' '}
                <Link href="/privacidad" target="_blank" style={{ color: C.purple2, textDecoration: 'none', fontWeight: 600 }}>Política de Privacidad</Link>
                {' '}de EscalaClub.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creando cuenta...' : role === 'creator' ? '🚀 Crear cuenta de creador' : '✨ Crear cuenta gratis'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
