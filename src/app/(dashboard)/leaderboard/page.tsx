import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'

const C = { bg: 'var(--bg)', bg1: 'var(--bg1)', bg2: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', muted2: 'var(--muted2)', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get top members by points across all communities
  const { data: leaders } = await supabase
    .from('ec_community_members')
    .select('user_id, points, level')
    .order('points', { ascending: false })
    .limit(50)

  const { data: myStats } = await supabase
    .from('ec_community_members')
    .select('points, level')
    .eq('user_id', user.id)
    .order('points', { ascending: false })
    .limit(1)

  const myPoints = myStats?.[0]?.points ?? 0
  const myRank = leaders?.findIndex(l => l.user_id === user.id) ?? -1

  const medals = ['🥇','🥈','🥉']

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>Leaderboard 🏆</h1>
        <p style={{ fontSize: 14, color: C.muted }}>Los miembros más activos de Komunio</p>
      </div>

      {/* My stats */}
      {myRank >= 0 && (
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 28, color: C.purple2, minWidth: 40, textAlign: 'center' }}>#{myRank + 1}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Tu posición</div>
            <div style={{ fontSize: 12, color: C.muted }}>{myPoints.toLocaleString()} puntos acumulados</div>
          </div>
          <div style={{ marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 24, color: C.gold }}>{myPoints.toLocaleString()} pts</div>
        </div>
      )}

      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 60px', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${C.border}` }}>
          {['#','Miembro','Puntos','País'].map(h => (
            <div key={h} style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {leaders && leaders.length > 0 ? leaders.map((l: any, i) => {
          const isMe = l.user_id === user.id
          const profile = null
          return (
            <div key={`${l.user_id}-${i}`} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 60px', gap: 8, padding: '12px 16px', borderBottom: i < leaders.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', background: isMe ? 'rgba(124,58,237,0.05)' : 'transparent' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: i < 3 ? 20 : 14, color: i < 3 ? C.gold : C.muted, textAlign: 'center' }}>
                {i < 3 ? medals[i] : `${i + 1}`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 13, color: C.purple2, flexShrink: 0, overflow: 'hidden' }}>
                  {'?'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    {'Usuario'} {isMe && <span style={{ fontSize: 10, color: C.purple2 }}>• tú</span>}
                  </div>
                  {l.level && <div style={{ fontSize: 10, color: C.muted }}>Nivel {l.level}</div>}
                </div>
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, color: C.gold }}>{(l.points ?? 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{'—'}</div>
            </div>
          )
        }) : (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Sé el primero</h3>
            <p style={{ fontSize: 14, color: C.muted }}>Únete a comunidades y gana puntos para aparecer aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}
