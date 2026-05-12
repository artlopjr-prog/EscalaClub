'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

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
    if (error) { toast.error('Email o contraseña incorrectos'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left panel — branding */}
      <div style={{ flex: 1, background: 'var(--bg1)', borderRight: '1px solid var(--border)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="hidden lg:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 20, letterSpacing: '-0.04em' }}>EscalaClub</span>
        </div>

        <div>
          <div style={{ fontSize: 48, marginBottom: 24 }}>👋</div>
          <h2 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Bienvenido de vuelta.<br />
            <span className="text-gradient-static">Tu comunidad</span><br />
            te espera.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.6 }}>
            Entra y continúa construyendo tu negocio educativo en LATAM.
          </p>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', gap: 32 }}>
          {[['10K+','Miembros'],['$2.4M','Generados'],['200+','Comunidades']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 22, letterSpacing: '-0.04em' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }} className="lg:hidden">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 800, fontSize: 18 }}>EscalaClub</span>
          </div>

          <h1 style={{ fontFamily: 'Cabinet Grotesk', fontWeight: 900, fontSize: 32, letterSpacing: '-0.04em', marginBottom: 8 }}>Iniciar sesión</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 36 }}>
            ¿Sin cuenta? <Link href="/registro" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Regístrate gratis →</Link>
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted2)', marginBottom: 7, fontFamily: 'Cabinet Grotesk', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted2)', fontFamily: 'Cabinet Grotesk', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contraseña</label>
                <Link href="/recuperar" style={{ fontSize: 12, color: '#A78BFA', textDecoration: 'none' }}>¿Olvidaste?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ marginTop: 32, padding: '16px', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Al entrar aceptas los <a href="#" style={{ color: '#A78BFA' }}>Términos de servicio</a> y la <a href="#" style={{ color: '#A78BFA' }}>Política de privacidad</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
