'use client'

import { useState } from 'react'
import { Lock, Star, Zap, Trophy, Shield } from 'lucide-react'

const RARITY_CONFIG = {
  common:    { label: 'Común',     color: '#9596B5', glow: 'rgba(149,150,181,0.2)',  border: 'rgba(149,150,181,0.25)', order: 1 },
  rare:      { label: 'Raro',      color: '#3B8EF5', glow: 'rgba(59,142,245,0.25)',  border: 'rgba(59,142,245,0.3)',   order: 2 },
  epic:      { label: 'Épico',     color: '#A78BFF', glow: 'rgba(167,139,255,0.3)',  border: 'rgba(167,139,255,0.35)', order: 3 },
  legendary: { label: 'Legendario',color: '#E9A020', glow: 'rgba(233,160,32,0.35)', border: 'rgba(233,160,32,0.4)',   order: 4 },
}

const CAT_CONFIG: Record<string, { label: string; emoji: string }> = {
  platform:  { label: 'Plataforma', emoji: '⚡' },
  community: { label: 'Comunidad',  emoji: '🌐' },
  challenge: { label: 'Retos',      emoji: '🎯' },
  course:    { label: 'Cursos',     emoji: '📚' },
  social:    { label: 'Social',     emoji: '💬' },
  special:   { label: 'Especial',   emoji: '⭐' },
}

type Badge = {
  id: string; slug: string; name: string; description: string; emoji: string
  category: string; color: string; rarity: string; trigger_type: string
  trigger_value: number; is_secret: boolean; earned: boolean; earned_at?: string
}

interface Props {
  userId: string
  badges: Badge[]
  earnedCount: number
  totalCount: number
  profile: any
}

export default function BadgesClient({ userId, badges, earnedCount, totalCount, profile }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Badge | null>(null)

  const filtered = badges.filter(b => {
    const catOk = filter === 'all' || filter === 'earned' ? true : b.category === filter
    const earnedOk = filter === 'earned' ? b.earned : true
    const rarityOk = rarityFilter === 'all' ? true : b.rarity === rarityFilter
    return catOk && earnedOk && rarityOk
  })

  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>EscalaClub</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,5vw,42px)', letterSpacing: '-0.04em', marginBottom: 6 }}>
          🎖 Mis Badges
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)' }}>Logros que demuestran tu progreso en EscalaClub</p>
      </div>

      {/* PROGRESS HERO */}
      <div style={{ background: 'linear-gradient(135deg, rgba(123,94,248,0.1), rgba(233,160,32,0.05))', border: '1px solid rgba(123,94,248,0.2)', borderRadius: 20, padding: '24px 28px', marginBottom: 28, display: 'flex', gap: 28, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 52, lineHeight: 1, color: 'var(--purple2)' }}>{earnedCount}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>de {totalCount} badges</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            <span>Progreso de colección</span>
            <span style={{ fontWeight: 700, color: 'var(--purple2)' }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 8, marginBottom: 12 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(RARITY_CONFIG).map(([rarity, cfg]) => {
              const count = badges.filter(b => b.rarity === rarity && b.earned).length
              const total = badges.filter(b => b.rarity === rarity).length
              return (
                <div key={rarity} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{cfg.label}: <strong style={{ color: cfg.color }}>{count}/{total}</strong></span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Category */}
        <div style={{ display: 'flex', gap: 3, background: 'var(--bg1)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
          {[['all','Todos','🏅'], ['earned','Obtenidos','✅'], ...Object.entries(CAT_CONFIG).map(([k,v]) => [k, v.label, v.emoji])].map(([k, label, emoji]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', background: filter === k ? 'var(--bg3)' : 'transparent', color: filter === k ? 'var(--text)' : 'var(--muted2)', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Rarity */}
        <div style={{ display: 'flex', gap: 3, background: 'var(--bg1)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
          <button onClick={() => setRarityFilter('all')} style={{ padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', background: rarityFilter === 'all' ? 'var(--bg3)' : 'transparent', color: rarityFilter === 'all' ? 'var(--text)' : 'var(--muted)', transition: 'all .15s' }}>Todos</button>
          {Object.entries(RARITY_CONFIG).map(([rarity, cfg]) => (
            <button key={rarity} onClick={() => setRarityFilter(rarity)}
              style={{ padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', background: rarityFilter === rarity ? cfg.border : 'transparent', color: rarityFilter === rarity ? cfg.color : 'var(--muted)', transition: 'all .15s' }}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* BADGES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {filtered.map(b => {
          const cfg = RARITY_CONFIG[b.rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.common
          const isSelected = selected?.id === b.id

          return (
            <div key={b.id} onClick={() => setSelected(b === selected ? null : b)}
              style={{
                borderRadius: 16, padding: '20px 14px', textAlign: 'center', cursor: 'pointer',
                background: b.earned
                  ? `linear-gradient(135deg, ${b.color}15, ${b.color}08)`
                  : 'var(--bg1)',
                border: `1px solid ${b.earned ? cfg.border : 'var(--border)'}`,
                boxShadow: b.earned && isSelected ? `0 0 24px ${cfg.glow}` : b.earned ? `0 4px 16px ${cfg.glow}` : 'none',
                transition: 'all .2s',
                opacity: b.earned ? 1 : 0.5,
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>

              {/* Legendary shimmer */}
              {b.earned && b.rarity === 'legendary' && (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, transparent 30%, ${b.color}15 50%, transparent 70%)`, backgroundSize: '200% 200%', animation: 'gradMove 3s ease infinite', pointerEvents: 'none' }} />
              )}

              {/* Rarity dot */}
              <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: b.earned ? cfg.color : 'var(--border2)' }} />

              {/* Lock overlay */}
              {!b.earned && (
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <Lock size={11} color="var(--muted)" />
                </div>
              )}

              {/* Emoji */}
              <div style={{
                fontSize: 36, marginBottom: 10, lineHeight: 1,
                filter: b.earned ? 'none' : 'grayscale(100%) opacity(0.4)',
                transition: 'filter .2s',
              }}>
                {b.emoji}
              </div>

              {/* Name */}
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: b.earned ? 'var(--text)' : 'var(--muted)', marginBottom: 4, lineHeight: 1.2 }}>
                {b.name}
              </div>

              {/* Rarity label */}
              <div style={{ fontSize: 9, fontWeight: 700, color: b.earned ? cfg.color : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {cfg.label}
              </div>

              {/* Earned date */}
              {b.earned && b.earned_at && (
                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
                  {new Date(b.earned_at).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          Sin badges en esta categoría aún. ¡Sigue participando para desbloquearlos!
        </div>
      )}

      {/* DETAIL PANEL — aparece al seleccionar */}
      {selected && (() => {
        const cfg = RARITY_CONFIG[selected.rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.common
        return (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg2)', border: `1px solid ${cfg.border}`,
            borderRadius: 20, padding: '20px 24px', boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${cfg.glow}`,
            zIndex: 100, width: 'clamp(300px, 90vw, 460px)', animation: 'fadeUp .25s ease',
            display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <div style={{ fontSize: 44, flexShrink: 0, filter: selected.earned ? 'none' : 'grayscale(100%) opacity(0.4)' }}>
              {selected.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 16 }}>{selected.name}</div>
                <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, background: `${cfg.color}18`, borderRadius: 99, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{cfg.label}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.5, marginBottom: 8 }}>{selected.description}</div>
              {selected.earned ? (
                <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                  ✓ Obtenido{selected.earned_at ? ` · ${new Date(selected.earned_at).toLocaleDateString('es')}` : ''}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {selected.trigger_type === 'xp' ? `Necesitas ${selected.trigger_value?.toLocaleString()} XP` :
                   selected.trigger_type === 'streak' ? `${selected.trigger_value} días de racha consecutivos` :
                   selected.trigger_type === 'posts' ? `Publicar ${selected.trigger_value} posts` :
                   'Completa la acción requerida para obtenerlo'}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, padding: 4, flexShrink: 0 }}>✕</button>
          </div>
        )
      })()}
    </div>
  )
}
