'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, User, Globe, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const COUNTRIES = ['Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Ecuador','El Salvador','Guatemala','Honduras','México','Nicaragua','Panamá','Paraguay','Perú','Puerto Rico','República Dominicana','Uruguay','Venezuela','Otro']

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', country: '', language: 'es' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) { toast.error('Completa todos los campos'); return }
    if (form.password.length < 8) { toast.error('Mínimo 8 caracteres'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name, country: form.country, language: form.language } }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    // Send welcome email (non-blocking)
    fetch('/api/emails/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.full_name, email: form.email }),
    }).catch(() => {})
    toast.success('¡Cuenta creada!')
    router.push('/onboarding')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left branding */}
      <div style={{ flex: 1, background: 'var(--bg1)', borderRight: '1px solid var(--border)', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="hidden lg:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.04em' }}>EscalaClub</span>
        </div>
        <div>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🚀</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Empieza hoy.<br />
            <span style={{ background: 'linear-gradient(135deg, #9F67FF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sin límites.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted2)', lineHeight: 1.6 }}>
            Crea tu comunidad, vende cursos y genera ingresos recurrentes en LATAM.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['$0','Costo inicial'],['14 días','Prueba gratis'],['100%','Tus ingresos']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.04em' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }} className="lg:hidden">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>EscalaClub</span>
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '-0.04em', marginBottom: 8 }}>Crear cuenta gratis</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
            ¿Ya tienes cuenta? <Link href="/login" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Inicia sesión →</Link>
          </p>

          {/* Language toggle */}
          <div style={{ display: 'flex', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {[['es','🇪🇸 Español'],['pt','🇧🇷 Português']].map(([lang, label]) => (
              <button key={lang} onClick={() => set('language', lang)} style={{
                flex: 1, padding: '8px', borderRadius: 9, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                background: form.language === lang ? 'var(--grad-purple)' : 'transparent',
                color: form.language === lang ? '#fff' : 'var(--muted)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted2)', marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {form.language === 'es' ? 'Nombre completo' : 'Nome completo'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Juan García" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted2)', marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="tu@email.com" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted2)', marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {form.language === 'es' ? 'Contraseña' : 'Senha'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Mín. 8 caracteres" className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Country */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted2)', marginBottom: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>País</label>
              <select value={form.country} onChange={e => set('country', e.target.value)} className="input" style={{ cursor: 'pointer' }}>
                <option value="">{form.language === 'es' ? 'Selecciona tu país' : 'Selecione seu país'}</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Al registrarte aceptas nuestros <Link href="#" style={{ color: '#A78BFA' }}>Términos</Link> y <Link href="#" style={{ color: '#A78BFA' }}>Privacidad</Link>
            </p>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creando cuenta...' : form.language === 'es' ? 'Crear cuenta gratis' : 'Criar conta grátis'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
