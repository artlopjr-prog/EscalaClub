'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Calendar, Clock, Video, Users, Plus, X, Check, MapPin } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }
const INP: React.CSSProperties = { width: '100%', background: '#13131C', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '11px 14px', color: '#EEEDF5', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }
const L: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 7, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }

interface Event {
  id: string; community_id: string; title: string; description?: string
  starts_at: string; duration_min?: number; meet_url?: string; rsvp_count: number
  community?: { id: string; name: string; slug: string; primary_color?: string }
}

interface Props {
  events: Event[]
  rsvpIds: Set<string>
  userId: string
  ownedCommunities: { id: string; name: string; primary_color?: string }[]
  isCreator: boolean
}

export default function EventosClient({ events: initialEvents, rsvpIds: initialRsvps, userId, ownedCommunities, isCreator }: Props) {
  const supabase = createClient()
  const [events, setEvents] = useState(initialEvents)
  const [rsvpIds, setRsvpIds] = useState(initialRsvps)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    community_id: ownedCommunities[0]?.id ?? '',
    title: '', description: '', starts_at: '', duration_min: '60', meet_url: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.starts_at) >= now).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  const past = events.filter(e => new Date(e.starts_at) < now).sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }

  async function createEvent() {
    if (!form.title.trim() || !form.starts_at || !form.community_id) {
      toast.error('Completa título, comunidad y fecha'); return
    }
    setSaving(true)
    const { data, error } = await supabase.from('ec_events').insert({
      community_id: form.community_id,
      host_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      starts_at: new Date(form.starts_at).toISOString(),
      duration_min: parseInt(form.duration_min) || 60,
      meet_url: form.meet_url.trim() || null,
      rsvp_count: 0,
    }).select('*, community:ec_communities(id, name, slug, primary_color)').single()
    if (error) { toast.error('Error: ' + error.message); setSaving(false); return }
    setEvents([data as Event, ...events])
    setForm({ community_id: ownedCommunities[0]?.id ?? '', title: '', description: '', starts_at: '', duration_min: '60', meet_url: '' })
    setShowCreate(false)
    setSaving(false)
    toast.success('¡Evento creado! 🎉')
  }

  async function toggleRsvp(eventId: string) {
    const hasRsvp = rsvpIds.has(eventId)
    if (hasRsvp) {
      await supabase.from('ec_event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId)
      setRsvpIds(prev => { const n = new Set(prev); n.delete(eventId); return n })
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvp_count: Math.max(0, e.rsvp_count - 1) } : e))
    } else {
      await supabase.from('ec_event_rsvps').insert({ event_id: eventId, user_id: userId })
      setRsvpIds(prev => new Set([...prev, eventId]))
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvp_count: e.rsvp_count + 1 } : e))
      toast.success('¡RSVP confirmado! 📅')
    }
  }

  function EventCard({ event, isPast }: { event: Event; isPast?: boolean }) {
    const accent = event.community?.primary_color ?? '#7C3AED'
    const hasRsvp = rsvpIds.has(event.id)
    return (
      <div style={{ background: C.bg1, border: `1px solid ${isPast ? C.border : accent + '33'}`, borderRadius: 20, padding: 20, opacity: isPast ? 0.7 : 1 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {/* Date block */}
          <div style={{ width: 56, height: 56, borderRadius: 14, background: accent + '15', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${accent}33` }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: accent, lineHeight: 1 }}>
              {new Date(event.starts_at).getDate()}
            </div>
            <div style={{ fontSize: 10, color: accent, fontWeight: 700, textTransform: 'uppercase' }}>
              {new Date(event.starts_at).toLocaleDateString('es', { month: 'short' })}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>{event.title}</h3>
            {event.description && <p style={{ fontSize: 13, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>{event.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: C.muted }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {formatDate(event.starts_at)}
              </span>
              {event.duration_min && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>⏱ {event.duration_min} min</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} /> {event.rsvp_count} asistentes
              </span>
              {event.community && <span style={{ padding: '1px 8px', borderRadius: 99, background: accent + '15', color: accent, fontSize: 10, fontWeight: 700 }}>{event.community.name}</span>}
            </div>
          </div>
        </div>
        {!isPast && (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => toggleRsvp(event.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: hasRsvp ? 'rgba(0,214,143,0.1)' : `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: hasRsvp ? C.green : '#fff', border: hasRsvp ? `1px solid rgba(0,214,143,0.3)` : 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13 }}>
              {hasRsvp ? <><Check size={14} /> Confirmado</> : <><Calendar size={14} /> Asistir</>}
            </button>
            {event.meet_url && !isPast && (
              <a href={event.meet_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: C.text, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                <Video size={14} /> Unirse
              </a>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: 28, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>Calendario 📅</h1>
          <p style={{ fontSize: 13, color: C.muted }}>{upcoming.length} eventos próximos</p>
        </div>
        {isCreator && ownedCommunities.length > 0 && (
          <button onClick={() => setShowCreate(!showCreate)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: showCreate ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13 }}>
            {showCreate ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Crear evento</>}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 20 }}>Nuevo evento</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ownedCommunities.length > 1 && (
              <div>
                <label style={L}>Comunidad</label>
                <select value={form.community_id} onChange={e => set('community_id', e.target.value)} style={{ ...INP, cursor: 'pointer' }}>
                  {ownedCommunities.map(c => <option key={c.id} value={c.id} style={{ background: '#13131C' }}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={L}>Título del evento *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Sesión en vivo — Marketing con IA" style={INP} />
            </div>
            <div>
              <label style={L}>Descripción</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="¿De qué se trata el evento?" rows={3} style={{ ...INP, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
              <div>
                <label style={L}>Fecha y hora *</label>
                <input type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} style={{ ...INP, colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={L}>Duración (minutos)</label>
                <input type="number" value={form.duration_min} onChange={e => set('duration_min', e.target.value)} min="15" step="15" style={INP} />
              </div>
            </div>
            <div>
              <label style={L}>Link de Zoom / Meet</label>
              <input value={form.meet_url} onChange={e => set('meet_url', e.target.value)} placeholder="https://zoom.us/j/... o https://meet.google.com/..." style={INP} />
            </div>
            <button onClick={createEvent} disabled={saving} style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creando...' : '🚀 Crear evento'}
            </button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Próximos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Sin eventos próximos</h3>
          <p style={{ fontSize: 14, color: C.muted }}>
            {isCreator && ownedCommunities.length > 0 ? 'Crea tu primer evento en vivo para tu comunidad.' : 'Los eventos de tus comunidades aparecerán aquí cuando el creador los programe.'}
          </p>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Pasados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {past.slice(0, 5).map(e => <EventCard key={e.id} event={e} isPast />)}
          </div>
        </div>
      )}
    </div>
  )
}
