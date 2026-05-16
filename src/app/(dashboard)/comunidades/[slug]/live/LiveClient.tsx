'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X, Radio, ExternalLink, Trash2, Play } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', red: '#FF4D6A', gold: '#F0A500' }
const INP: React.CSSProperties = { width: '100%', background: '#13131C', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '11px 14px', color: '#EEEDF5', fontSize: 13, outline: 'none' }
const L: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 7, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }

function getYoutubeId(url: string) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([^&\n?#]+)/)?.[1] ?? null
}
function getYoutubeLiveEmbed(url: string) {
  const id = getYoutubeId(url)
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`
  return url
}

interface Session { id: string; title: string; description?: string; stream_url?: string; platform: string; status: string; starts_at?: string; thumbnail_url?: string }

export default function LiveClient({ community, sessions: initialSessions, userId, isOwner }: any) {
  const supabase = createClient()
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [showCreate, setShowCreate] = useState(false)
  const [watchSession, setWatchSession] = useState<Session | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', stream_url: '', platform: 'youtube', starts_at: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const accent = community.primary_color ?? '#7C3AED'

  const liveNow = sessions.filter(s => s.status === 'live')
  const scheduled = sessions.filter(s => s.status === 'scheduled')
  const past = sessions.filter(s => s.status === 'ended')

  async function createSession() {
    if (!form.title.trim() || !form.stream_url.trim()) { toast.error('Título y URL requeridos'); return }
    setSaving(true)
    const { data, error } = await supabase.from('ec_live_sessions').insert({
      community_id: community.id, host_id: userId,
      title: form.title.trim(), description: form.description.trim() || null,
      stream_url: form.stream_url.trim(), platform: form.platform,
      status: 'scheduled',
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
    }).select().single()
    if (error) { toast.error('Error: ' + error.message); setSaving(false); return }
    setSessions([data as Session, ...sessions])
    setForm({ title: '', description: '', stream_url: '', platform: 'youtube', starts_at: '' })
    setShowCreate(false)
    setSaving(false)
    toast.success('¡Sesión creada! 🎥')
  }

  async function goLive(sessionId: string) {
    await supabase.from('ec_live_sessions').update({ status: 'live' }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'live' } : s))
    toast.success('¡Estás en vivo! 🔴')
  }

  async function endLive(sessionId: string) {
    await supabase.from('ec_live_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'ended' } : s))
    toast.success('Sesión finalizada')
  }

  async function deleteSession(id: string) {
    if (!confirm('¿Eliminar esta sesión?')) return
    await supabase.from('ec_live_sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  function SessionCard({ session }: { session: Session }) {
    const isLive = session.status === 'live'
    return (
      <div style={{ background: C.bg1, border: `2px solid ${isLive ? C.red + '60' : C.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: isLive ? `0 0 20px ${C.red}20` : 'none' }}>
        {session.stream_url && getYoutubeId(session.stream_url) ? (
          <div style={{ height: 160, background: '#000', position: 'relative', cursor: 'pointer' }} onClick={() => setWatchSession(session)}>
            <img src={`https://img.youtube.com/vi/${getYoutubeId(session.stream_url)}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={20} color="#fff" fill="#fff" />
              </div>
            </div>
            {isLive && (
              <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 10px', borderRadius: 99, background: C.red, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} /> EN VIVO
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: 100, background: isLive ? `${C.red}15` : accent + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Radio size={32} color={isLive ? C.red : accent} />
            {isLive && <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 10px', borderRadius: 99, background: C.red, color: '#fff', fontSize: 11, fontWeight: 800 }}>🔴 EN VIVO</div>}
          </div>
        )}
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 4 }}>{session.title}</h3>
          {session.description && <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{session.description}</p>}
          {session.starts_at && <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{new Date(session.starts_at).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {session.status !== 'ended' && (
              <button onClick={() => setWatchSession(session)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: isLive ? C.red : accent, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                <Play size={12} /> {isLive ? 'Ver en vivo' : 'Abrir'}
              </button>
            )}
            {isOwner && session.status === 'scheduled' && (
              <button onClick={() => goLive(session.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'rgba(255,77,106,0.15)', color: C.red, border: `1px solid ${C.red}33`, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                🔴 Ir en vivo
              </button>
            )}
            {isOwner && isLive && (
              <button onClick={() => endLive(session.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', color: C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                Finalizar
              </button>
            )}
            {isOwner && (
              <button onClick={() => deleteSession(session.id)} style={{ padding: '7px', borderRadius: 9, background: 'transparent', color: C.muted, border: 'none', cursor: 'pointer', display: 'flex' }}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Video overlay */}
      {watchSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>{watchSession.title}</h2>
              <button onClick={() => setWatchSession(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', padding: '8px', borderRadius: 8, display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ aspectRatio: '16/9', width: '100%', borderRadius: 16, overflow: 'hidden' }}>
              {watchSession.stream_url && getYoutubeId(watchSession.stream_url) ? (
                <iframe src={getYoutubeLiveEmbed(watchSession.stream_url)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen" allowFullScreen />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <Radio size={48} color={C.red} />
                  <p style={{ color: '#fff', fontSize: 16 }}>Sesión en vivo</p>
                  {watchSession.stream_url && (
                    <a href={watchSession.stream_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: accent, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                      <ExternalLink size={15} /> Abrir en nueva pestaña
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/comunidades/${community.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, textDecoration: 'none', fontSize: 12, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}` }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 16, color: C.text, flex: 1 }}>🔴 Lives / Directos — {community.name}</h1>
        {isOwner ? (
          <button onClick={() => setShowCreate(!showCreate)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: showCreate ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${C.red}, #FF6B6B)`, color: showCreate ? C.muted : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>
            {showCreate ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Programar live</>}
          </button>
        ) : (
          <div style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: C.muted, fontSize: 11 }}>
            Solo el creador puede iniciar lives
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
        {/* Create form */}
        {showCreate && isOwner && (
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 22, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 18 }}>🎥 Nueva sesión en vivo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={L}>Título *</label><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Sesión en vivo — Estrategias de crecimiento" style={INP} /></div>
              <div><label style={L}>Descripción</label><textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="¿De qué se trata esta sesión?" rows={2} style={{ ...INP, resize: 'vertical' }} /></div>
              <div>
                <label style={L}>Plataforma</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ value: 'youtube', label: '▶️ YouTube Live' }, { value: 'zoom', label: '📹 Zoom' }, { value: 'other', label: '🔗 Otro' }].map(p => (
                    <button key={p.value} onClick={() => set('platform', p.value)} style={{ flex: 1, padding: '9px', borderRadius: 10, background: form.platform === p.value ? 'rgba(124,58,237,0.15)' : C.bg2, border: `2px solid ${form.platform === p.value ? C.purple : C.border}`, color: form.platform === p.value ? C.purple2 : C.muted, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div><label style={L}>URL del stream *</label><input value={form.stream_url} onChange={e => set('stream_url', e.target.value)} placeholder="https://youtube.com/live/... o https://zoom.us/j/..." style={INP} /></div>
              <div><label style={L}>Fecha y hora (opcional)</label><input type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} style={{ ...INP, colorScheme: 'dark' }} /></div>
              <button onClick={createSession} disabled={saving} style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Creando...' : '🎥 Crear sesión'}
              </button>
            </div>
          </div>
        )}

        {/* Live now */}
        {liveNow.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: C.red, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} /> En vivo ahora
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {liveNow.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          </div>
        )}

        {/* Scheduled */}
        {scheduled.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Próximas sesiones</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {scheduled.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Grabaciones anteriores</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {past.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎥</div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 8 }}>Sin sesiones aún</h3>
            <p style={{ fontSize: 14, color: C.muted }}>{isOwner ? 'Crea tu primera sesión en vivo para tu comunidad.' : 'El creador aún no ha programado sesiones en vivo.'}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
