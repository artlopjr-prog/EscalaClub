'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Star, Gift, Trophy, Flame, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// ── SPIN CONFIG ──
const PRIZES = [
  { label: '+50 XP',    type: 'xp',      amount: 50,   color: '#7B5EF8', emoji: '⚡', weight: 30 },
  { label: '+100 XP',   type: 'xp',      amount: 100,  color: '#A78BFF', emoji: '⚡', weight: 20 },
  { label: '+200 XP',   type: 'xp',      amount: 200,  color: '#E9A020', emoji: '🌟', weight: 10 },
  { label: '+5 días 🔥',type: 'streak',  amount: 5,    color: '#FF6B35', emoji: '🔥', weight: 8  },
  { label: 'Badge 🎖',  type: 'badge',   amount: 1,    color: '#00CF88', emoji: '🎖', weight: 5  },
  { label: '+500 XP',   type: 'jackpot', amount: 500,  color: '#E9A020', emoji: '💰', weight: 2  },
  { label: 'Suerte 😅', type: 'nothing', amount: 0,    color: '#6E6E90', emoji: '😅', weight: 15 },
  { label: '+25 XP',    type: 'xp',      amount: 25,   color: '#9596B5', emoji: '⚡', weight: 10 },
]

// ── TRIVIA QUESTIONS ──
const TRIVIA: { q: string; opts: string[]; correct: number; cat: string }[] = [
  { q: '¿Cuál es el beneficio principal de construir una comunidad en LATAM?', opts: ['Mayor alcance orgánico', 'Ingresos recurrentes y conexión real', 'Solo posicionamiento SEO', 'Reemplazar redes sociales'], correct: 1, cat: 'Comunidades' },
  { q: '¿Qué significa MRR en el contexto de un negocio digital?', opts: ['Maximum Revenue Rate', 'Monthly Recurring Revenue', 'Marketing Return Rate', 'Minimum Required Revenue'], correct: 1, cat: 'Negocios' },
  { q: '¿Cuál es la plataforma de mensajería más usada en LATAM?', opts: ['Telegram', 'Signal', 'WhatsApp', 'Discord'], correct: 2, cat: 'LATAM' },
  { q: '¿Qué es el "churn rate" en una membresía?', opts: ['Tasa de nuevos suscriptores', 'Tasa de cancelaciones', 'Precio mensual promedio', 'Número de posts al mes'], correct: 1, cat: 'Negocios' },
  { q: '¿Cuál es la mejor forma de retener miembros en una comunidad?', opts: ['Descuentos constantes', 'Más contenido gratuito', 'Valor constante + conexión genuina', 'Grupos de WhatsApp'], correct: 2, cat: 'Comunidades' },
  { q: '¿Qué significa "top of mind" en marketing?', opts: ['Estar en la primera página de Google', 'Ser la primera marca que recuerda el consumidor', 'Tener el mayor presupuesto publicitario', 'Publicar todos los días'], correct: 1, cat: 'Marketing' },
  { q: '¿Qué es un "lead magnet"?', opts: ['Un tipo de anuncio de pago', 'Un recurso gratuito para captar emails', 'Una estrategia de SEO', 'Un plugin de WordPress'], correct: 1, cat: 'Marketing' },
  { q: '¿Cuál es el país con más usuarios de internet en LATAM?', opts: ['Argentina', 'Colombia', 'Brasil', 'México'], correct: 2, cat: 'LATAM' },
]

interface Props {
  userId: string
  profile: { name: string; avatar?: string; xp: number; level: number; streak: number }
  todaySpin: any
  topWinners: any[]
}

export default function JuegosClient({ userId, profile, todaySpin, topWinners }: Props) {
  const supabase = createClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<(typeof PRIZES)[0] | null>(null)
  const [alreadySpun, setAlreadySpun] = useState(!!todaySpin)
  const [spinAngle, setSpinAngle] = useState(0)
  const [activeGame, setActiveGame] = useState<'spin' | 'trivia'>('spin')

  // Trivia state
  const [triviaIdx, setTriviaIdx] = useState(() => Math.floor(Math.random() * TRIVIA.length))
  const [triviaSelected, setTriviaSelected] = useState<number | null>(null)
  const [triviaAnswered, setTriviaAnswered] = useState(false)
  const [triviaStreak, setTriviaStreak] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  const trivia = TRIVIA[triviaIdx]

  // Draw wheel on mount
  useEffect(() => {
    drawWheel(spinAngle)
  }, [spinAngle])

  function drawWheel(angle: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = cx - 8
    const slice = (2 * Math.PI) / PRIZES.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Outer ring glow
    const grd = ctx.createRadialGradient(cx, cy, r - 20, cx, cy, r + 10)
    grd.addColorStop(0, 'rgba(123,94,248,0)')
    grd.addColorStop(1, 'rgba(123,94,248,0.15)')
    ctx.beginPath()
    ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI)
    ctx.fillStyle = grd
    ctx.fill()

    PRIZES.forEach((p, i) => {
      const start = angle + i * slice
      const end = start + slice

      // Slice
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = i % 2 === 0 ? p.color + 'EE' : p.color + 'AA'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Emoji + text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + slice / 2)
      ctx.textAlign = 'right'
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(p.label, r - 10, 4)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
    const centerGrd = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 28)
    centerGrd.addColorStop(0, '#9F7FFF')
    centerGrd.addColorStop(1, '#5B3ECC')
    ctx.fillStyle = centerGrd
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Center icon
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚡', cx, cy)
  }

  function pickPrize(): typeof PRIZES[0] {
    const total = PRIZES.reduce((s, p) => s + p.weight, 0)
    let r = Math.random() * total
    for (const p of PRIZES) { r -= p.weight; if (r <= 0) return p }
    return PRIZES[0]
  }

  async function spinWheel() {
    if (spinning || alreadySpun) return
    setSpinning(true)
    setSpinResult(null)

    const prize = pickPrize()
    const prizeIdx = PRIZES.indexOf(prize)
    const slice = (2 * Math.PI) / PRIZES.length
    const targetAngle = (2 * Math.PI * 8) + (2 * Math.PI - (prizeIdx * slice + slice / 2))

    let current = 0
    const duration = 4000
    const start = performance.now()

    function animate(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      current = eased * targetAngle
      drawWheel(current)
      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        setSpinAngle(current % (2 * Math.PI))
        setSpinResult(prize)
        setSpinning(false)
        setAlreadySpun(true)
        saveSpin(prize)
        toast.success(`¡${prize.emoji} ${prize.label}!`, { duration: 3000 })
      }
    }
    requestAnimationFrame(animate)
  }

  async function saveSpin(prize: typeof PRIZES[0]) {
    // Insert spin record
    await supabase.from('ec_daily_spins').insert({
      user_id: userId,
      prize_type: prize.type,
      prize_amount: prize.amount,
    }).then(() => {})

    // Award XP if applicable
    if (prize.type === 'xp' || prize.type === 'jackpot') {
      await supabase.rpc('award_xp', { p_user_id: userId, p_amount: prize.amount }).then(() => {})
    }
  }

  async function answerTrivia(idx: number) {
    if (triviaAnswered) return
    setTriviaSelected(idx)
    setTriviaAnswered(true)
    const correct = idx === trivia.correct
    if (correct) {
      const xp = 50 + triviaStreak * 10
      setXpEarned(xp)
      setTriviaStreak(s => s + 1)
      toast.success(`¡Correcto! +${xp} XP 🎯`, { duration: 2500 })
      await supabase.rpc('award_xp', { p_user_id: userId, p_amount: xp }).then(() => {})
    } else {
      setTriviaStreak(0)
      toast.error('Incorrecto 😅', { duration: 2000 })
    }
  }

  function nextTrivia() {
    setTriviaAnswered(false)
    setTriviaSelected(null)
    setXpEarned(0)
    setTriviaIdx(i => (i + 1) % TRIVIA.length)
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>EscalaClub</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,5vw,42px)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>
          🎮 Juegos
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)' }}>Gana XP, badges y premios jugando cada día</p>
      </div>

      {/* XP del usuario */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--purple2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Nivel {profile.level} · {profile.xp.toLocaleString()} XP</div>
          </div>
        </div>
        {profile.streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 99, padding: '4px 12px' }}>
            <span>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35' }}>{profile.streak} días de racha</span>
          </div>
        )}
      </div>

      {/* GAME TABS */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 24, background: 'var(--bg1)', borderRadius: 12, padding: 3, width: 'fit-content', border: '1px solid var(--border)' }}>
        {([['spin', '🎡 Spin Diario'], ['trivia', '🧠 Trivia']] as const).map(([g, label]) => (
          <button key={g} onClick={() => setActiveGame(g)}
            style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none', background: activeGame === g ? 'var(--bg3)' : 'transparent', color: activeGame === g ? 'var(--text)' : 'var(--muted2)', transition: 'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── SPIN GAME ── */}
      {activeGame === 'spin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          <div>
            {/* Wheel */}
            <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                {alreadySpun ? '✓ Ya giraste hoy' : 'Gira una vez al día'}
              </div>

              {/* Pointer */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>▼</div>
                <canvas ref={canvasRef} width={300} height={300} style={{ borderRadius: '50%', boxShadow: '0 0 40px rgba(123,94,248,0.2), 0 8px 32px rgba(0,0,0,0.4)', display: 'block' }} />
              </div>

              <div style={{ marginTop: 20 }}>
                {!alreadySpun ? (
                  <button onClick={spinWheel} disabled={spinning}
                    className="btn-primary" style={{ fontSize: 15, padding: '13px 36px', opacity: spinning ? .7 : 1 }}>
                    {spinning ? '⚡ Girando...' : '🎡 ¡Girar!'}
                  </button>
                ) : (
                  <div>
                    {spinResult ? (
                      <div style={{ background: `${PRIZES[0].color}15`, border: `1px solid ${spinResult.color}33`, borderRadius: 12, padding: '14px 20px', display: 'inline-block' }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{spinResult.emoji}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, color: spinResult.color }}>{spinResult.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>¡Premio ganado hoy!</div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(0,207,136,0.08)', border: '1px solid rgba(0,207,136,0.2)', borderRadius: 12, padding: '14px 24px', display: 'inline-block' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>
                          ✓ Ya giraste hoy — vuelve mañana
                        </div>
                        {todaySpin && (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                            Premio anterior: {todaySpin.prize_type} · {todaySpin.prize_amount > 0 ? `+${todaySpin.prize_amount}` : 'Sin premio'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Prizes legend */}
            <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Premios posibles</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {PRIZES.filter(p => p.type !== 'nothing').map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: `${p.color}10` }}>
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Winners sidebar */}
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Trophy size={14} color="var(--gold)" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13 }}>Jackpots esta semana</span>
            </div>
            {topWinners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                Sé el primero en ganar el jackpot 💰
              </div>
            ) : topWinners.map((w: any, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < topWinners.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#0A0A12', flexShrink: 0 }}>
                  {(w.profile?.display_name ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{w.profile?.display_name ?? 'Usuario'}</div>
                  <div style={{ fontSize: 10, color: 'var(--gold)' }}>+{w.prize_amount} XP 💰</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRIVIA GAME ── */}
      {activeGame === 'trivia' && (
        <div style={{ maxWidth: 640 }}>
          {/* Trivia streak */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
            {triviaStreak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 99, padding: '5px 14px' }}>
                <Flame size={14} color="#FF6B35" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35' }}>Racha: {triviaStreak} correctas</span>
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Respuestas correctas = más XP · La racha multiplica
            </div>
          </div>

          {/* Question card */}
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Category header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(123,94,248,0.15), rgba(123,94,248,0.05))', borderBottom: '1px solid var(--border)', padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{trivia.cat}</span>
              </div>
              {triviaStreak > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>+{50 + triviaStreak * 10} XP si aciertas</span>
              )}
            </div>

            <div style={{ padding: '24px 22px' }}>
              {/* Question */}
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, lineHeight: 1.3, marginBottom: 22 }}>
                {trivia.q}
              </h2>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {trivia.opts.map((opt, i) => {
                  const isSelected = triviaSelected === i
                  const isCorrect = i === trivia.correct
                  const showResult = triviaAnswered

                  let bg = 'var(--bg2)'
                  let border = 'var(--border2)'
                  let color = 'var(--text)'
                  let icon = null

                  if (showResult) {
                    if (isCorrect) { bg = 'rgba(0,207,136,0.12)'; border = 'rgba(0,207,136,0.35)'; color = 'var(--green)'; icon = <CheckCircle size={16} color="var(--green)" /> }
                    else if (isSelected && !isCorrect) { bg = 'rgba(255,77,106,0.12)'; border = 'rgba(255,77,106,0.35)'; color = 'var(--red)'; icon = <XCircle size={16} color="var(--red)" /> }
                  } else if (isSelected) {
                    bg = 'rgba(123,94,248,0.12)'; border = 'rgba(123,94,248,0.4)'; color = 'var(--purple2)'
                  }

                  return (
                    <button key={i} onClick={() => answerTrivia(i)} disabled={triviaAnswered}
                      style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: bg, border: `1px solid ${border}`, color, fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: triviaAnswered ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
                    </button>
                  )
                })}
              </div>

              {/* Result + next */}
              {triviaAnswered && (
                <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 12, background: triviaSelected === trivia.correct ? 'rgba(0,207,136,0.08)' : 'rgba(255,77,106,0.08)', border: `1px solid ${triviaSelected === trivia.correct ? 'rgba(0,207,136,0.2)' : 'rgba(255,77,106,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: triviaSelected === trivia.correct ? 'var(--green)' : 'var(--red)', marginBottom: 2 }}>
                      {triviaSelected === trivia.correct ? `¡Correcto! 🎯 +${xpEarned} XP` : 'Incorrecto 😅'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {triviaSelected === trivia.correct
                        ? triviaStreak > 1 ? `Racha de ${triviaStreak} · Próxima vale más XP` : 'Sigue así'
                        : `La respuesta correcta era: ${trivia.opts[trivia.correct]}`}
                    </div>
                  </div>
                  <button onClick={nextTrivia} className="btn-primary" style={{ fontSize: 12, padding: '9px 16px' }}>
                    <RotateCcw size={13} /> Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
            Sin límite de preguntas · Racha = más XP por respuesta correcta
          </div>
        </div>
      )}
    </div>
  )
}
