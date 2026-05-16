'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Megaphone, Send, Trash2, Pin } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

export default function AnunciosPage() {
  const supabase = createClient()
  const router = useRouter()
  const [community, setCommunity] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: comm } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
      if (!comm) { router.push('/creator'); return }
      setCommunity(comm)
      const { data: posts } = await supabase.from('ec_posts').select('*').eq('community_id', comm.id).eq('is_announcement', true).order('created_at', { ascending: false })
      setAnnouncements(posts ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function publish() {
    if (!content.trim() || !community) return
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Create post as announcement
    const { data: post, error } = await supabase.from('ec_posts').insert({
      community_id: community.id,
      author_id: user!.id,
      title: title.trim() || null,
      content: content.trim(),
      is_announcement: true,
      is_pinned: pinned,
    }).select().single()

    if (error) { toast.error('Error: ' + error.message); setPosting(false); return }

    // Notify all members
    const { data: members } = await supabase.from('ec_community_members').select('user_id').eq('community_id', community.id).eq('status', 'active').neq('user_id', user!.id)
    if (members && members.length > 0) {
      await supabase.from('ec_notifications').insert(
        members.map(m => ({
          user_id: m.user_id,
          community_id: community.id,
          type: 'announcement',
          title: `📢 ${community.name}`,
          body: title.trim() || content.trim().slice(0, 80),
          action_url: `/comunidades/${community.slug}/foro`,
          actor_id: user!.id,
        }))
      )
    }

    setAnnouncements([post, ...announcements])
    setTitle(''); setContent(''); setPinned(false)
    setPosting(false)
    toast.success(`¡Anuncio publicado y notificados ${members?.length ?? 0} miembros! 📢`)
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('¿Eliminar este anuncio?')) return
    await supabase.from('ec_posts').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  return (
    <div style={{ padding: 28, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/creator" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 12 }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em', color: C.text, marginBottom: 2 }}>📢 Anuncios</h1>
          <p style={{ fontSize: 12, color: C.muted }}>Los anuncios se destacan en el foro y notifican a todos tus miembros</p>
        </div>
      </div>

      {/* Compose */}
      <div style={{ background: C.bg1, border: `1px solid rgba(240,165,0,0.2)`, borderRadius: 20, padding: 22, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Megaphone size={16} color={C.gold} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.gold }}>Nuevo anuncio</span>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del anuncio (opcional)" style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', marginBottom: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }} />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe tu anuncio aquí. Todos los miembros recibirán una notificación..." rows={4} style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Outfit, sans-serif', lineHeight: 1.6 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: C.muted2 }}>
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.gold, cursor: 'pointer' }} />
            <Pin size={13} color={pinned ? C.gold : C.muted} /> Anclar al foro
          </label>
          <button onClick={publish} disabled={posting || !content.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 12, background: content.trim() ? `linear-gradient(135deg, ${C.gold}, #E09400)` : 'rgba(255,255,255,0.06)', color: content.trim() ? '#000' : C.muted, border: 'none', cursor: content.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13 }}>
            <Send size={14} /> {posting ? 'Publicando...' : 'Publicar y notificar'}
          </button>
        </div>
      </div>

      {/* Past announcements */}
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Anuncios anteriores</h2>
      {announcements.length > 0 ? announcements.map((a, i) => (
        <div key={a.id} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              {a.title && <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{a.title}</div>}
              <p style={{ fontSize: 13, color: C.muted2, margin: 0, lineHeight: 1.6 }}>{a.content}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 11, color: C.muted }}>
                <span>{new Date(a.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {a.is_pinned && <span style={{ color: C.gold }}>📌 Anclado</span>}
              </div>
            </div>
            <button onClick={() => deleteAnnouncement(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8, flexShrink: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
          <p style={{ fontSize: 14, color: C.muted }}>Aún no has publicado ningún anuncio</p>
        </div>
      )}
    </div>
  )
}
