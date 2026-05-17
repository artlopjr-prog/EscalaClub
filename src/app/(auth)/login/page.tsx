'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const C = {
  bg: '#1F2335', bg1: '#262B42', bg2: '#2D3452',
  border: 'var(--border)',
  text: 'var(--text)', muted: '#7B7FA8', muted2: '#A8AACC',
  purple: '#6366F1', purple2: '#818CF8',
  green: '#00D68F', red: '#FF4D6A',
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Completa todos los campos'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', overflowX: 'hidden' }}>
      {/* Left branding — desktop only */}
      <div style={{ flex: 1, background: C.bg1, borderRight: `1px solid ${C.border}`, padding: 48, flexDirection: 'column', justifyContent: 'space-between', display: 'none' }} className="auth-left-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${C.purple}44` }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 20, color: C.text, letterSpacing: '-0.03em' }}>EscalaClub</span>
        </div>
        <div>
          <div style={{ fontSize: 44, marginBottom: 24 }}>👋</div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: C.text }}>
            Welcome back.<br />
            <span style={{ background: `linear-gradient(135deg, ${C.purple2}, ${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your community<br />is waiting for you.</span>
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6 }}>
            Join and continue building your educational business in LATAM.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['$2.4M','Generados'],['>200','Comunidades'],['>10K','Miembros']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 22, color: C.text }}>{v}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }} className="lg:hidden">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${C.purple}, ${C.purple2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, color: C.text }}>EscalaClub</span>
          </div>

          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', marginBottom: 6, color: C.text }}>Iniciar sesión</h1>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
            ¿Sin cuenta? <Link href="/registro" style={{ color: C.purple2, textDecoration: 'none', fontWeight: 600 }}>Regístrate gratis →</Link>
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted2, marginBottom: 7, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted2, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contraseña</label>
                <Link href="/recuperar" style={{ fontSize: 12, color: C.purple2, textDecoration: 'none' }}>¿Olvidaste?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña" className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Iniciando...' : 'Iniciar sesión'} {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 24, lineHeight: 1.5 }}>
            Al entrar aceptas los{" "}
            <Link href="/terminos" style={{ color: C.purple2, textDecoration: 'none' }}>Términos de servicio</Link>
            {" "}y la{" "}
            <Link href="/privacidad" style={{ color: C.purple2, textDecoration: 'none' }}>Política de privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
