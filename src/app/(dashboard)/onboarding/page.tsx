'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Zap, ArrowRight, Check, Users, BookOpen } from 'lucide-react'

const GOALS_CREATOR = [
  { id: 'community', icon: '👥', label: 'Crear mi comunidad' },
  { id: 'courses',   icon: '🎓', label: 'Vender cursos online' },
  { id: 'coaching',  icon: '🎯', label: 'Ofrecer coaching/mentoría' },
  { id: 'brand',     icon: '⭐', label: 'Construir mi marca personal' },
]
const GOALS_MEMBER = [
  { id: 'learn',   icon: '📚', label: 'Aprender nuevas habilidades' },
  { id: 'network', icon: '🤝', label: 'Hacer networking' },
  { id: 'grow',    icon: '📈', label: 'Hacer crecer mi negocio' },
  { id: 'career',  icon: '💼', label: 'Avanzar en mi carrera' },
]
const TOPICS = [
  'Marketing Digital','Ventas','Inteligencia Artificial','Emprendimiento',
  'Liderazgo','Finanzas','Tecnología','Operaciones','E-commerce','Personal Branding',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'member'|'creator'|null>(null)
  const [goals, setGoals] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [otherTopic, setOtherTopic] = useState('')
  const [showOther, setShowOther] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleGoal = (id: string) => setGoals(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id])
  
  const toggleTopic = (t: string) => {
    if (t === 'otro') {
      setShowOther(!showOther)
      return
    }
    setTopics(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t])
  }

  const totalTopics = topics.length + (showOther && otherTopic.trim() ? 1 : 0)

  async function finish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('ec_profiles').update({ onboarding_completed: true }).eq('id', user.id)
    toast.success('¡Bienvenido a EscalaClub! 🎉', { duration: 3000 })
    router.push(role === 'creator' ? '/creator/comunidad' : '/comunidades')
  }

  const btn = (enabled: boolean, onClick: () => void, label: string) => (
    <button onClick={onClick} disabled={!enabled} style={{
      flex: 1, padding: '14px', borderRadius: 12,
      background: enabled ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'rgba(255,255,255,0.06)',
      color: enabled ? '#fff' : '#6B6A80', border: 'none',
      cursor: enabled ? 'pointer' : 'not-allowed',
      fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'all 0.2s',
    }}>
      {label} <ArrowRight size={18} />
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#06060A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.04em', color: '#EEEDF5' }}>EscalaClub</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6B6A80' }}>Paso {step} de 3</span>
            <span style={{ fontSize: 12, color: '#6B6A80' }}>{Math.round((step/3)*100)}%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${(step/3)*100}%`, height: '100%', background: 'linear-gradient(90deg, #7C3AED, #9F67FF)', borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Step 1 — Role */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: '#EEEDF5', marginBottom: 8 }}>
                ¿Cómo vas a usar EscalaClub?
              </h1>
              <p style={{ fontSize: 14, color: '#6B6A80' }}>Esto nos ayuda a personalizar tu experiencia</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 28 }}>
              {[
                { id: 'member', emoji: '📚', title: 'Quiero aprender', desc: 'Accede a comunidades y cursos de los mejores expertos de LATAM', color: '#3B82F6' },
                { id: 'creator', emoji: '👥', title: 'Quiero crear', desc: 'Lanza tu comunidad, vende cursos y genera ingresos recurrentes', color: '#7C3AED' },
              ].map(opt => (
                <button key={opt.id} onClick={() => setRole(opt.id as 'member'|'creator')} style={{
                  padding: '24px 20px', borderRadius: 16,
                  border: `2px solid ${role === opt.id ? opt.color : 'rgba(255,255,255,0.09)'}`,
                  background: role === opt.id ? opt.color + '15' : '#0D0D14',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{opt.emoji}</div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#EEEDF5' }}>{opt.title}</h3>
                  <p style={{ fontSize: 12, color: '#6B6A80', lineHeight: 1.5 }}>{opt.desc}</p>
                  {role === opt.id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, color: opt.color, fontSize: 12, fontWeight: 600 }}>
                      <Check size={14} /> Seleccionado
                    </div>
                  )}
                </button>
              ))}
            </div>

            {btn(!!role, () => role && setStep(2), 'Continuar')}
          </div>
        )}

        {/* Step 2 — Goals */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⭐</div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: '#EEEDF5', marginBottom: 8 }}>
                {role === 'creator' ? '¿Cuál es tu objetivo?' : '¿Qué quieres lograr?'}
              </h1>
              <p style={{ fontSize: 14, color: '#6B6A80' }}>Selecciona todos los que apliquen</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 10, marginBottom: 28 }}>
              {(role === 'creator' ? GOALS_CREATOR : GOALS_MEMBER).map(g => (
                <button key={g.id} onClick={() => toggleGoal(g.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12,
                  border: `1px solid ${goals.includes(g.id) ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  background: goals.includes(g.id) ? 'rgba(124,58,237,0.12)' : '#0D0D14',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 22 }}>{g.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: goals.includes(g.id) ? '#EEEDF5' : '#9998B0', flex: 1 }}>{g.label}</span>
                  {goals.includes(g.id) && <Check size={14} color="#9F67FF" style={{ flexShrink: 0 }} />}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#6B6A80', cursor: 'pointer', fontSize: 14 }}>
                Atrás
              </button>
              {btn(goals.length > 0, () => goals.length > 0 && setStep(3), 'Continuar')}
            </div>
          </div>
        )}

        {/* Step 3 — Topics */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: '#EEEDF5', marginBottom: 8 }}>
                ¿Qué temas te interesan?
              </h1>
              <p style={{ fontSize: 14, color: '#6B6A80' }}>Selecciona al menos 2</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {TOPICS.map(t => (
                <button key={t} onClick={() => toggleTopic(t)} style={{
                  padding: '9px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                  background: topics.includes(t) ? '#7C3AED' : '#0D0D14',
                  color: topics.includes(t) ? '#fff' : '#9998B0',
                  border: `1px solid ${topics.includes(t) ? '#7C3AED' : 'rgba(255,255,255,0.09)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {topics.includes(t) ? '✓ ' : ''}{t}
                </button>
              ))}

              {/* Otro button */}
              <button onClick={() => setShowOther(!showOther)} style={{
                padding: '9px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                background: showOther ? '#7C3AED' : '#0D0D14',
                color: showOther ? '#fff' : '#9998B0',
                border: `1px solid ${showOther ? '#7C3AED' : 'rgba(255,255,255,0.09)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {showOther ? '✓ ' : ''}Otro
              </button>
            </div>

            {/* Otro input */}
            {showOther && (
              <div style={{ marginBottom: 20 }}>
                <input
                  value={otherTopic}
                  onChange={e => setOtherTopic(e.target.value)}
                  placeholder="¿Cuál es tu tema? Ej: Fotografía, Gaming, Cocina..."
                  className="input"
                  autoFocus
                />
                <div style={{ fontSize: 11, color: '#6B6A80', marginTop: 6 }}>
                  Escribe el tema que te interesa
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24, fontSize: 12, color: totalTopics >= 2 ? '#00D68F' : '#6B6A80' }}>
              {totalTopics} de mínimo 2 seleccionados
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#6B6A80', cursor: 'pointer', fontSize: 14 }}>
                Atrás
              </button>
              <button
                onClick={() => totalTopics >= 2 && !loading && finish()}
                disabled={totalTopics < 2 || loading}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12,
                  background: totalTopics >= 2 ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'rgba(255,255,255,0.06)',
                  color: totalTopics >= 2 ? '#fff' : '#6B6A80', border: 'none',
                  cursor: totalTopics >= 2 ? 'pointer' : 'not-allowed',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {loading ? 'Entrando...' : role === 'creator' ? '🚀 Crear mi comunidad' : '🎉 Entrar a EscalaClub'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
