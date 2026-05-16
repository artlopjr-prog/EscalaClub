'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Zap, Trophy, Flame, Globe, Star, Plus, ArrowLeft,
  Calendar, Users, Lock, CheckCircle2, Circle, Crown,
  Medal, Gift, Sparkles, Target, BookOpen, PenLine
} from 'lucide-react'

const C = {
  bg:      '#06060A', bg1: '#0D0D14', bg2: '#13131C', bg3: '#1A1A26',
  border:  'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.1)',
  borderGold:   'rgba(240,165,0,0.25)', borderPurple: 'rgba(124,58,237,0.3)',
  text:    '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0',
  purple:  '#7C3AED', purpleL: '#9F67FF', purpleDim: 'rgba(124,58,237,0.12)',
  gold:    '#F0A500', goldL: '#FFD166',   goldDim: 'rgba(240,165,0,0.1)',
  success: '#00D68F', successDim: 'rgba(0,214,143,0.1)',
  danger:  '#FF4D6A', dangerDim: 'rgba(255,77,106,0.1)',
  info:    '#3B8BF5', infoDim: 'rgba(59,139,245,0.1)',
}

const INP: React.CSSProperties = {
  width: '100%', background: C.bg2, border: `1px solid ${C.border2}`,
  borderRadius: 10, padding: '10px 13px', color: C.text,
  fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif',
}
const LBL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: C.muted2, marginBottom: 6,
  fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase',
  display: 'block',
}

const COVER_COLORS: Record<string, string> = {
  cv1: 'linear-gradient(135deg,#0a0015,#1a0035,#2d0060)',
  cv2: 'linear-gradient(135deg,#0a1500,#1a3500,#2d6000)',
  cv3: 'linear-gradient(135deg,#150a00,#351a00,#603500)',
  cv4: 'linear-gradient(135deg,#00100a,#002018,#004030)',
  cv5: 'linear-gradient(135deg,#100010,#200030,#400060)',
  cv6: 'linear-gradient(135deg,#100500,#301000,#602000)',
}

type Challenge = {
  id: string; title: string; description: string; emoji: string
  challenge_type: string; duration_days: number; starts_at: string
  ends_at: string; status: string; participant_count: number; origin: string
  community_id?: string; reward_badge: boolean; reward_xp: boolean
  reward_xp_amount: number; reward_cert: boolean; reward_title: boolean
  reward_free_month: boolean; reward_homepage: boolean; reward_insider: boolean
  reward_role: boolean; reward_coupon: boolean; reward_content: boolean
  community?: { id: string; name: string; slug: string; primary_color?: string }
}

type Participation = {
  challenge_id: string; current_streak: number; max_streak: number
  days_completed: number; status: string; last_check_at: string | null
}

interface Props {
  userId: string
  userCountry: string
  isAdmin: boolean
  canCreate: boolean
  platformChallenges: Challenge[]
  communityChallenges: Challenge[]
  myParticipations: Participation[]
  ownedCommunities: { id: string; name: string; primary_color?: string }[]
  stats: { totalStreak: number; activeCount: number; totalXP: number }
}

type View = 'home' | 'detail' | 'leaderboard' | 'crear'
type LBTab = 'global' | 'country' | 'community'

export default function RetosClient({
  userId, userCountry, isAdmin, canCreate,
  platformChallenges, communityChallenges,
  myParticipations, ownedCommunities, stats,
}: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [view, setView] = useState<View>('home')
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [participations, setParticipations] = useState<Participation[]>(myParticipations)
  const [lbTab, setLbTab] = useState<LBTab>('global')
  const [lbData, setLbData] = useState<any[]>([])
  const [lbLoading, setLbLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [form, setForm] = useState({
    origin: isAdmin ? 'platform' : 'community',
    community_id: ownedCommunities[0]?.id ?? '',
    title: '', description: '', emoji: '🔥',
    challenge_type: 'habit', duration_days: 30,
    starts_at: new Date().toISOString().split('T')[0],
    reward_badge: true, reward_xp: true, reward_xp_amount: 500,
    reward_cert: false, reward_title: false, reward_free_month: false,
    reward_homepage: false, reward_insider: false, reward_role: false,
    reward_coupon: false, reward_content: false,
  })

  const getParticipation = (challengeId: string) =>
    participations.find(p => p.challenge_id === challengeId)

  const isParticipating = (challengeId: string) => !!getParticipation(challengeId)

  const todayChecked = (challengeId: string) => {
    const p = getParticipation(challengeId)
    if (!p?.last_check_at) return false
    const today = new Date().toDateString()
    return new Date(p.last_check_at).toDateString() === today
  }

  const getDayNumber = (challenge: Challenge) => {
    const start = new Date(challenge.starts_at)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.min(diff + 1, challenge.duration_days))
  }

  // JOIN challenge
  async function joinChallenge(challenge: Challenge) {
    if (isParticipating(challenge.id)) return
    const { error } = await supabase
      .from('ec_challenge_participants')
      .insert({ challenge_id: challenge.id, user_id: userId })
    if (error) { toast.error('Error al unirse al reto'); return }
    setParticipations(prev => [...prev, {
      challenge_id: challenge.id, current_streak: 0, max_streak: 0,
      days_completed: 0, status: 'active', last_check_at: null,
    }])
    toast.success(`¡Te uniste a "${challenge.title}"! 🎉`)
    router.refresh()
  }

  // CHECK day
  async function checkDay(challenge: Challenge) {
    if (!isParticipating(challenge.id)) {
      await joinChallenge(challenge)
    }
    if (todayChecked(challenge.id)) {
      toast('Ya marcaste el día de hoy ✅', { icon: '🔥' })
      return
    }
    const dayNum = getDayNumber(challenge)
    const { error } = await supabase
      .from('ec_challenge_progress')
      .insert({ challenge_id: challenge.id, user_id: userId, day_number: dayNum })
    if (error && error.code !== '23505') {
      toast.error('Error al registrar el día')
      return
    }
    setParticipations(prev => prev.map(p =>
      p.challenge_id === challenge.id
        ? { ...p, days_completed: p.days_completed + 1, current_streak: p.current_streak + 1, last_check_at: new Date().toISOString() }
        : p
    ))
    toast.success(`¡Día ${dayNum} completado! 🔥 Racha: ${(getParticipation(challenge.id)?.current_streak ?? 0) + 1}`)
    router.refresh()
  }

  // LOAD leaderboard
  async function loadLeaderboard(challengeId: string, tab: LBTab) {
    setLbLoading(true)
    setLbTab(tab)
    const { data } = await supabase
      .from('ec_challenge_participants')
      .select(`
        user_id, current_streak, max_streak, days_completed, status,
        profile:ec_profiles(display_name, avatar_url, country)
      `)
      .eq('challenge_id', challengeId)
      .order('current_streak', { ascending: false })
      .limit(50)

    let filtered = data ?? []
    if (tab === 'country') {
      filtered = filtered.filter((r: any) => r.profile?.country === userCountry)
    }
    setLbData(filtered)
    setLbLoading(false)
  }

  // CREATE challenge
  async function createChallenge() {
    if (!form.title.trim()) { toast.error('El nombre es obligatorio'); return }
    const payload = {
      ...form,
      created_by: userId,
      community_id: form.origin === 'community' ? form.community_id : null,
      starts_at: new Date(form.starts_at).toISOString(),
      status: new Date(form.starts_at) <= new Date() ? 'active' : 'upcoming',
    }
    const { error } = await supabase.from('ec_challenges').insert(payload)
    if (error) { toast.error('Error al crear el reto: ' + error.message); return }
    toast.success('¡Reto publicado! ⚡')
    setView('home')
    router.refresh()
  }

  function openDetail(c: Challenge) {
    setSelectedChallenge(c)
    setView('detail')
    if (c) loadLeaderboard(c.id, 'global')
  }

  const mainStreak = Math.max(...participations.map(p => p.current_streak), 0)
  const platformParticipating = platformChallenges.filter(c => isParticipating(c.id)).length
  const communityParticipating = communityChallenges.filter(c => isParticipating(c.id)).length

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>
            ⚡ Retos
          </h1>
          <p style={{ fontSize: 13, color: C.muted2 }}>
            Retos oficiales de EscalaClub + desafíos de tus comunidades
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canCreate && (
            <button className="btn-primary" onClick={() => setView('crear')} style={{ gap: 6 }}>
              <Plus size={15} /> Crear Reto
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { val: `🔥 ${mainStreak}`, label: 'Mejor racha activa', color: C.goldL },
          { val: platformParticipating + communityParticipating, label: 'Retos activos', color: C.purpleL },
          { val: stats.totalXP.toLocaleString(), label: 'XP en retos', color: C.success },
          { val: participations.filter(p => p.status === 'completed').length, label: 'Completados', color: C.text },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 22, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 22, background: C.bg1, borderRadius: 10, padding: 3, width: 'fit-content', border: `1px solid ${C.border}` }}>
        {(['home','detail','leaderboard', ...(canCreate ? ['crear'] : [])] as View[]).map((v, i) => {
          const labels: Record<string, string> = { home: '🏠 Todos', detail: '⚡ Detalle', leaderboard: '🏆 Leaderboard', crear: '＋ Crear' }
          const active = view === v
          return (
            <button key={v} onClick={() => v !== 'detail' ? setView(v) : (selectedChallenge && setView(v))}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: active ? C.bg3 : 'transparent', color: active ? C.text : C.muted2, fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}>
              {labels[v]}
            </button>
          )
        })}
      </div>

      {/* ═══ VIEW: HOME ═══ */}
      {view === 'home' && (
        <div>
          {/* RETOS OFICIALES */}
          <SectionHeader title="⭐ Retos Oficiales EscalaClub" badge="Toda la plataforma" badgeColor={C.goldDim} badgeText={C.gold} />

          {platformChallenges.length === 0 ? (
            <EmptyState icon={<Star size={32} color={C.gold} />} title="Sin retos oficiales activos" sub="Vuelve pronto — se publican nuevos retos cada mes" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {platformChallenges.map(c => (
                <ChallengeCard key={c.id} challenge={c} participation={getParticipation(c.id)}
                  todayDone={todayChecked(c.id)} dayNum={getDayNumber(c)}
                  onOpen={() => openDetail(c)} onJoin={() => joinChallenge(c)} onCheck={() => checkDay(c)}
                  isOfficial={true} />
              ))}
            </div>
          )}

          {/* RETOS DE COMUNIDADES */}
          <SectionHeader title="🌐 Retos de tus Comunidades" badge={`${communityParticipating} activos`} badgeColor={C.purpleDim} badgeText={C.purpleL} />

          {communityChallenges.length === 0 ? (
            <EmptyState icon={<Globe size={32} color={C.purpleL} />} title="Sin retos en tus comunidades" sub="Únete a más comunidades o pide a tu creador que cree un reto" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {communityChallenges.map(c => (
                <ChallengeCard key={c.id} challenge={c} participation={getParticipation(c.id)}
                  todayDone={todayChecked(c.id)} dayNum={getDayNumber(c)}
                  onOpen={() => openDetail(c)} onJoin={() => joinChallenge(c)} onCheck={() => checkDay(c)}
                  isOfficial={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ VIEW: DETAIL ═══ */}
      {view === 'detail' && selectedChallenge && (() => {
        const c = selectedChallenge
        const p = getParticipation(c.id)
        const dayNum = getDayNumber(c)
        const progress = p ? Math.round((p.days_completed / c.duration_days) * 100) : 0
        const checkedToday = todayChecked(c.id)

        // Build calendar days
        const days = Array.from({ length: c.duration_days }, (_, i) => i + 1)

        return (
          <div>
            <button onClick={() => setView('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.muted2, fontSize: 13, cursor: 'pointer', marginBottom: 18, padding: 0 }}>
              <ArrowLeft size={15} /> Volver a Retos
            </button>

            <div style={{ background: c.origin === 'platform' ? `linear-gradient(135deg,rgba(240,165,0,0.07),rgba(240,165,0,0.02))` : C.bg1, border: `1px solid ${c.origin === 'platform' ? C.borderGold : C.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>

              {/* Header */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: COVER_COLORS.cv1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{c.emoji}</div>
                <div style={{ flex: 1 }}>
                  {c.origin === 'platform' && (
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.gold, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>⭐ Reto Oficial EscalaClub</div>
                  )}
                  {c.community && (
                    <div style={{ fontSize: 11, color: C.purpleL, marginBottom: 3 }}>🌐 {c.community.name}</div>
                  )}
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{c.title}</h2>
                  <p style={{ fontSize: 13, color: C.muted2 }}>{c.description}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <Pill color={C.dangerDim} text={C.danger} label={c.status === 'active' ? '🔴 Activo' : '⏳ Próximo'} />
                    <Pill color={C.goldDim} text={C.goldL} label={`${c.duration_days} días`} />
                    <Pill color={C.successDim} text={C.success} label={`${c.participant_count.toLocaleString()} participantes`} />
                    {p && <Pill color={C.purpleDim} text={C.purpleL} label={`Racha: 🔥 ${p.current_streak}`} />}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {p && (
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 18, background: C.bg2, borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>🔥</span>
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 30, color: C.gold, lineHeight: 1 }}>{p.current_streak}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>días seguidos</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, borderLeft: `1px solid ${C.border}`, paddingLeft: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 5 }}>
                      <span>Día {p.days_completed} de {c.duration_days}</span>
                      <span style={{ color: C.goldL, fontWeight: 700 }}>{progress}%</span>
                    </div>
                    <div style={{ height: 5, background: C.bg3, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${C.gold},${C.goldL})`, borderRadius: 99, transition: 'width .6s ease' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Calendario de progreso</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15,1fr)', gap: 3, marginBottom: 18 }}>
                {days.map(d => {
                  const isDone = p && d <= p.days_completed
                  const isToday = d === dayNum && c.status === 'active'
                  const isFuture = d > dayNum
                  return (
                    <div key={d} style={{
                      aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 600, cursor: 'pointer',
                      background: isDone ? C.success : isToday ? C.purple : isFuture ? C.bg3 : C.dangerDim,
                      color: isDone || isToday ? '#fff' : isFuture ? C.muted : C.danger,
                      boxShadow: isToday ? `0 0 10px ${C.purple}55` : 'none',
                    }}>{isDone ? '✓' : d}</div>
                  )
                })}
              </div>

              {/* Check button */}
              {c.status === 'active' && (
                <button
                  onClick={() => checkDay(c)}
                  disabled={checkedToday}
                  style={{
                    width: '100%', padding: 13, borderRadius: 10, border: checkedToday ? `1px solid ${C.success}44` : 'none',
                    fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, cursor: checkedToday ? 'default' : 'pointer',
                    background: checkedToday ? C.successDim : `linear-gradient(135deg,${C.purple},${C.purpleL})`,
                    color: checkedToday ? C.success : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18,
                    boxShadow: checkedToday ? 'none' : `0 0 20px ${C.purple}44`,
                    transition: 'all .2s',
                  }}>
                  {checkedToday ? <><CheckCircle2 size={18} /> ¡Día {dayNum} completado! 🔥</> : <><Circle size={18} /> Marcar día {dayNum} como completado</>}
                </button>
              )}

              {!isParticipating(c.id) && c.status === 'active' && (
                <button onClick={() => joinChallenge(c)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 18 }}>
                  <Zap size={15} /> Unirme a este reto
                </button>
              )}

              {/* Rewards */}
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                {c.origin === 'platform' ? 'Recompensas exclusivas EscalaClub' : 'Recompensas al completar'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginBottom: 20 }}>
                {c.reward_badge && <RewardCard icon="🎖" name="Badge Exclusivo" desc="En tu perfil para siempre" special={c.origin === 'platform'} />}
                {c.reward_xp && <RewardCard icon="⚡" name={`${c.reward_xp_amount} XP`} desc="Sube tu nivel global" unlocked />}
                {c.reward_cert && <RewardCard icon="📜" name="Certificado" desc="Con QR verificable" />}
                {c.reward_title && <RewardCard icon="🌎" name="Título Global" desc="Aparece en tu perfil" special />}
                {c.reward_free_month && <RewardCard icon="🎟" name="Mes Gratis" desc="Top 3 global" special />}
                {c.reward_homepage && <RewardCard icon="📣" name="En Homepage" desc="Feature público" special />}
                {c.reward_insider && <RewardCard icon="🔑" name="Insider Access" desc="Features anticipadas" special />}
                {c.reward_role && <RewardCard icon="👑" name="Rol Especial" desc="30 días en la comunidad" />}
                {c.reward_coupon && <RewardCard icon="🎫" name="Cupón" desc="Descuento próximo curso" />}
              </div>

              {/* Leaderboard */}
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Leaderboard del reto</div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 10, background: C.bg2, borderRadius: 9, padding: 3, width: 'fit-content', border: `1px solid ${C.border}` }}>
                {(['global','country','community'] as LBTab[]).map((t, i) => {
                  const labels = ['🌎 Global', `${userCountry === 'PA' ? '🇵🇦' : '🌍'} Mi País`, '🌐 Comunidad']
                  return (
                    <button key={t} onClick={() => loadLeaderboard(c.id, t)} style={{
                      padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: 'none', background: lbTab === t ? C.bg3 : 'transparent',
                      color: lbTab === t ? C.text : C.muted2, fontFamily: 'Inter, sans-serif',
                    }}>{labels[i]}</button>
                  )
                })}
              </div>

              {lbLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Cargando...</div>
              ) : (
                <div style={{ background: C.bg2, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  {lbData.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 13 }}>Sin participantes aún en esta vista</div>
                  )}
                  {lbData.slice(0, 10).map((row: any, i) => {
                    const isMe = row.user_id === userId
                    const medals = ['🥇', '🥈', '🥉']
                    const name = row.profile?.display_name ?? 'Usuario'
                    const initials = name.slice(0, 2).toUpperCase()
                    return (
                      <div key={row.user_id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        borderBottom: `1px solid ${C.border}`,
                        background: isMe ? `rgba(124,58,237,0.07)` : 'transparent',
                        transition: 'background .12s',
                      }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 12, width: 22, textAlign: 'center', color: i < 3 ? [C.gold, '#9ba8b5', '#c47c2a'][i] : isMe ? C.purpleL : C.muted }}>
                          {i < 3 ? medals[i] : `#${i + 1}`}
                        </div>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${C.purple},${C.purpleL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                          {row.profile?.avatar_url ? <img src={row.profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isMe ? C.purpleL : C.text }}>{name}{isMe ? ' (tú)' : ''}</div>
                          <div style={{ fontSize: 10, color: C.muted2 }}>🔥 {row.current_streak} días · {row.days_completed} completados</div>
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: i === 0 ? C.gold : isMe ? C.purpleL : C.muted2 }}>{row.current_streak}🔥</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* ═══ VIEW: LEADERBOARD GLOBAL ═══ */}
      {view === 'leaderboard' && (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>🏆 Leaderboard Global de Retos</div>
          <p style={{ fontSize: 13, color: C.muted2, marginBottom: 16 }}>Rankings de participantes en todos los retos de la plataforma</p>
          <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: C.bg2, borderRadius: 9, padding: 3, width: 'fit-content', border: `1px solid ${C.border}` }}>
            {(['global','country'] as LBTab[]).map((t, i) => {
              const labels = ['🌎 Global', '🗺 Mi País']
              return (
                <button key={t} onClick={() => { setLbTab(t); if (platformChallenges[0]) loadLeaderboard(platformChallenges[0].id, t) }}
                  style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: lbTab === t ? C.bg3 : 'transparent', color: lbTab === t ? C.text : C.muted2, fontFamily: 'Inter, sans-serif' }}>
                  {labels[i]}
                </button>
              )
            })}
          </div>
          {platformChallenges.length === 0 ? (
            <EmptyState icon={<Trophy size={32} color={C.gold} />} title="Sin retos oficiales activos" sub="El leaderboard global se activa con los retos oficiales" />
          ) : lbLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Cargando ranking...</div>
          ) : lbData.length === 0 ? (
            <EmptyState icon={<Users size={28} color={C.muted} />} title="Sin datos aún" sub="Únete al reto activo para aparecer en el ranking" />
          ) : (
            <div style={{ background: C.bg2, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              {lbData.slice(0, 20).map((row: any, i) => {
                const isMe = row.user_id === userId
                const medals = ['🥇', '🥈', '🥉']
                const name = row.profile?.display_name ?? 'Usuario'
                return (
                  <div key={row.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: isMe ? `rgba(124,58,237,0.07)` : 'transparent' }}>
                    <div style={{ width: 26, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 13, color: i < 3 ? [C.gold, '#9ba8b5', '#c47c2a'][i] : isMe ? C.purpleL : C.muted }}>
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${C.purple},${C.purpleL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isMe ? C.purpleL : C.text }}>{name}{isMe ? ' (tú) 👑' : ''}</div>
                      <div style={{ fontSize: 11, color: C.muted2 }}>{row.days_completed} días completados</div>
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: i === 0 ? C.gold : isMe ? C.purpleL : C.muted2 }}>{row.current_streak}🔥</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ VIEW: CREAR ═══ */}
      {view === 'crear' && canCreate && (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 19, marginBottom: 3 }}>Crear Nuevo Reto</div>
          <p style={{ fontSize: 13, color: C.muted2, marginBottom: 22 }}>Configura el reto para tu comunidad{isAdmin ? ' o para toda la plataforma' : ''}</p>

          {/* Origen */}
          {isAdmin && (
            <div style={{ marginBottom: 16 }}>
              <label style={LBL}>¿Quién organiza?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: 'community', label: '🌐 Mi Comunidad' }, { val: 'platform', label: '⭐ EscalaClub Oficial' }].map(o => (
                  <button key={o.val} onClick={() => setForm(f => ({ ...f, origin: o.val }))} style={{
                    padding: '9px 16px', borderRadius: 10, border: `1px solid ${form.origin === o.val ? C.borderGold : C.border2}`,
                    background: form.origin === o.val ? C.goldDim : C.bg2, color: form.origin === o.val ? C.goldL : C.muted2,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>{o.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Comunidad */}
          {form.origin === 'community' && ownedCommunities.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={LBL}>Comunidad</label>
              <select style={INP} value={form.community_id} onChange={e => setForm(f => ({ ...f, community_id: e.target.value }))}>
                {ownedCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={LBL}>Nombre del reto</label>
              <input style={INP} placeholder="Ej: 30 Días de Consistencia" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={LBL}>Descripción</label>
              <textarea style={{ ...INP, minHeight: 70, resize: 'vertical' }} placeholder="¿Qué lograrán los participantes?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div>
              <label style={LBL}>Emoji del reto</label>
              <input style={INP} maxLength={2} value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
            </div>
            <div>
              <label style={LBL}>Tipo</label>
              <select style={INP} value={form.challenge_type} onChange={e => setForm(f => ({ ...f, challenge_type: e.target.value }))}>
                <option value="habit">🗓 Hábito — check diario</option>
                <option value="educational">📚 Educativo — lección + acción</option>
                <option value="publication">✍️ Publicación — post diario</option>
              </select>
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={LBL}>Duración</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[7, 14, 21, 30, 60, 100].map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, duration_days: d }))} style={{
                    padding: '7px 14px', borderRadius: 99, border: `1px solid ${form.duration_days === d ? C.purple : C.border2}`,
                    background: form.duration_days === d ? C.purpleDim : C.bg2, color: form.duration_days === d ? C.purpleL : C.muted2,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>{d} días</button>
                ))}
              </div>
            </div>

            <div>
              <label style={LBL}>Fecha de inicio</label>
              <input style={INP} type="date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} />
            </div>
            <div>
              <label style={LBL}>XP al completar</label>
              <input style={INP} type="number" min={50} step={50} value={form.reward_xp_amount} onChange={e => setForm(f => ({ ...f, reward_xp_amount: Number(e.target.value) }))} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={LBL}>Recompensas al completar</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  { key: 'reward_badge', icon: '🎖', label: 'Badge exclusivo' },
                  { key: 'reward_xp', icon: '⚡', label: 'XP Bonus' },
                  { key: 'reward_cert', icon: '📜', label: 'Certificado' },
                  { key: 'reward_content', icon: '🔓', label: 'Desbloquear contenido' },
                  { key: 'reward_role', icon: '👑', label: 'Rol especial' },
                  { key: 'reward_coupon', icon: '🎫', label: 'Cupón descuento' },
                  ...(form.origin === 'platform' ? [
                    { key: 'reward_title', icon: '🌎', label: 'Título en perfil' },
                    { key: 'reward_free_month', icon: '🎟', label: 'Mes gratis (Top 3)' },
                    { key: 'reward_homepage', icon: '📣', label: 'Feature en homepage' },
                    { key: 'reward_insider', icon: '🔑', label: 'Acceso Insider' },
                  ] : []),
                ].map(r => {
                  const on = (form as any)[r.key]
                  return (
                    <div key={r.key} onClick={() => setForm(f => ({ ...f, [r.key]: !on }))} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${on ? C.borderPurple : C.border}`, background: on ? C.purpleDim : C.bg2, transition: 'all .15s',
                    }}>
                      <span style={{ fontSize: 16 }}>{r.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: on ? C.text : C.muted2 }}>{r.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
            <button className="btn-ghost" onClick={() => setView('home')}>Cancelar</button>
            <button className="btn-primary" onClick={createChallenge}>
              {form.origin === 'platform' ? '⭐ Publicar Reto Oficial' : '⚡ Publicar Reto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SUB-COMPONENTS ──

function SectionHeader({ title, badge, badgeColor, badgeText }: { title: string; badge: string; badgeColor: string; badgeText: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 4 }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15 }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: badgeColor, color: badgeText }}>{badge}</div>
    </div>
  )
}

function Pill({ color, text, label }: { color: string; text: string; label: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: color, color: text }}>{label}</span>
  )
}

function RewardCard({ icon, name, desc, unlocked, special }: { icon: string; name: string; desc: string; unlocked?: boolean; special?: boolean }) {
  const C_bg = special ? 'rgba(240,165,0,0.1)' : unlocked ? 'rgba(0,214,143,0.08)' : 'rgba(255,255,255,0.02)'
  const C_border = special ? 'rgba(240,165,0,0.25)' : unlocked ? 'rgba(0,214,143,0.2)' : 'rgba(255,255,255,0.06)'
  return (
    <div style={{ background: C_bg, border: `1px solid ${C_border}`, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{name}</div>
      <div style={{ fontSize: 10, color: '#6B6A80', lineHeight: 1.4 }}>{desc}</div>
    </div>
  )
}

function ChallengeCard({ challenge: c, participation: p, todayDone, dayNum, onOpen, onJoin, onCheck, isOfficial }: {
  challenge: Challenge; participation?: Participation; todayDone: boolean; dayNum: number
  onOpen: () => void; onJoin: () => void; onCheck: () => void; isOfficial: boolean
}) {
  const progress = p ? Math.round((p.days_completed / c.duration_days) * 100) : 0
  const statusColor = c.status === 'active' ? '#FF4D6A' : c.status === 'upcoming' ? '#F0A500' : '#00D68F'
  const statusLabel = c.status === 'active' ? '🔴 Activo' : c.status === 'upcoming' ? '⏳ Próximo' : '✓ Finalizado'
  const coverColors: Record<string, string> = {
    habit: 'linear-gradient(135deg,#0a0015,#2d0060)',
    educational: 'linear-gradient(135deg,#0a1500,#2d6000)',
    publication: 'linear-gradient(135deg,#150a00,#603500)',
  }

  return (
    <div onClick={onOpen} style={{
      background: isOfficial ? 'linear-gradient(135deg,rgba(240,165,0,0.06),rgba(240,165,0,0.02))' : '#0D0D14',
      border: `1px solid ${isOfficial ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
      transition: 'border-color .2s, transform .18s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = isOfficial ? 'rgba(240,165,0,0.4)' : 'rgba(255,255,255,0.12)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = isOfficial ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.06)' }}>

      {/* Cover */}
      <div style={{ height: 100, background: coverColors[c.challenge_type] ?? coverColors.habit, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '12px 14px' }}>
        {isOfficial && <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 800, color: '#F0A500', textTransform: 'uppercase', letterSpacing: '.06em', background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: 99, padding: '2px 8px' }}>⭐ Oficial</div>}
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44` }}>{statusLabel}</div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 34, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.6))' }}>{c.emoji}</div>
        {c.community && <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>🌐 {c.community.name}</div>}
      </div>

      {/* Body */}
      <div style={{ padding: '13px 14px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6B6A80', marginBottom: 4 }}>
          {c.challenge_type === 'habit' ? '🗓 Hábito' : c.challenge_type === 'educational' ? '📚 Educativo' : '✍️ Publicación'} · {c.duration_days} días
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, marginBottom: 5, lineHeight: 1.2 }}>{c.title}</div>
        <div style={{ fontSize: 12, color: '#9998B0', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</div>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6A80', marginBottom: 5 }}>
          {p ? <span>Día {p.days_completed} de {c.duration_days}</span> : <span>{c.participant_count.toLocaleString()} participantes</span>}
          {p ? <span style={{ color: '#F0A500' }}>🔥 {p.current_streak}</span> : <span style={{ color: '#9998B0' }}>{c.duration_days} días</span>}
        </div>
        <div style={{ height: 3, background: '#1A1A26', borderRadius: 99, overflow: 'hidden', marginBottom: 11 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: isOfficial ? 'linear-gradient(90deg,#b87a00,#F0A500)' : 'linear-gradient(90deg,#7C3AED,#9F67FF)', borderRadius: 99 }} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: 3 }}>
            {c.reward_badge && <span style={{ fontSize: 13 }}>🎖</span>}
            {c.reward_xp && <span style={{ fontSize: 13 }}>⚡</span>}
            {c.reward_cert && <span style={{ fontSize: 13 }}>📜</span>}
            {c.reward_title && <span style={{ fontSize: 13 }}>🌎</span>}
          </div>
          {c.status === 'active' && (
            p ? (
              <button onClick={onCheck} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700,
                background: todayDone ? 'rgba(0,214,143,0.15)' : 'linear-gradient(135deg,#7C3AED,#9F67FF)',
                color: todayDone ? '#00D68F' : '#fff', cursor: todayDone ? 'default' : 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}>{todayDone ? '✅ Hecho' : `⬜ Día ${dayNum}`}</button>
            ) : (
              <button onClick={onJoin} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, background: 'rgba(124,58,237,0.2)', color: '#9F67FF', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                + Unirme
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#0D0D14', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#6B6A80' }}>{sub}</div>
    </div>
  )
}
