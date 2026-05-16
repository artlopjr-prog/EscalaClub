'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0' }
const L: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 8, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }
const INP: React.CSSProperties = { width: '100%', background: '#13131C', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '12px 16px', color: '#EEEDF5', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }

export default function NuevoCursoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', description: '', cover_url: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleCreate() {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: community } = await supabase.from('ec_communities').select('id').eq('owner_id', user.id).maybeSingle()
    if (!community) { toast.error('Primero crea tu comunidad'); setSaving(false); return }
    const { data, error } = await supabase.from('ec_courses').insert({
      community_id: community.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      cover_url: form.cover_url.trim() || null,
      is_published: false,
      position: 0,
    }).select().single()
    if (error) { toast.error('Error: ' + error.message); setSaving(false); return }
    toast.success('¡Curso creado! Ahora agrega módulos y lecciones.')
    router.push(`/creator/cursos/${data.id}`)
  }

  return (
    <div style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/creator/cursos" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Volver
        </Link>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: '-0.04em', color: C.text }}>Nuevo curso</h1>
      </div>

      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={L}>Título del curso *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Marketing Digital con IA en 2025" style={INP} />
        </div>
        <div>
          <label style={L}>Descripción</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="¿Qué aprenderán los estudiantes?" rows={4} style={{ ...INP, resize: 'vertical', minHeight: 100 }} />
        </div>
        <div>
          <label style={L}>URL de portada (imagen)</label>
          <input value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://..." style={INP} />
          {form.cover_url && (
            <div style={{ marginTop: 10, height: 120, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <img src={form.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
        <button onClick={handleCreate} disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
          <Save size={16} /> {saving ? 'Creando...' : 'Crear curso'}
        </button>
      </div>
    </div>
  )
}
