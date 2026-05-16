'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Plus, Save, Eye, EyeOff, Trash2, ChevronDown, ChevronRight, Play, GripVertical, Video } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', red: '#FF4D6A' }
const L: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 7, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }
const INP: React.CSSProperties = { width: '100%', background: '#13131C', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '11px 14px', color: '#EEEDF5', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }

function getVideoThumb(url: string) {
  if (!url) return null
  const ytId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
  return null
}

export default function EditCursoPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newModTitle, setNewModTitle] = useState('')
  const [expandedMod, setExpandedMod] = useState<string | null>(null)
  const [editLesson, setEditLesson] = useState<any>(null)
  const [newLesson, setNewLesson] = useState<Record<string, { title: string; video_url: string; content: string; duration_min: string }>>({})

  useEffect(() => { loadData() }, [courseId])

  async function loadData() {
    const [{ data: c }, { data: mods }] = await Promise.all([
      supabase.from('ec_courses').select('*').eq('id', courseId).single(),
      supabase.from('ec_course_modules').select('*, lessons:ec_course_lessons(*)').eq('course_id', courseId).order('position'),
    ])
    if (!c) { router.push('/creator/cursos'); return }
    setCourse(c)
    setModules(mods?.map(m => ({ ...m, lessons: (m.lessons ?? []).sort((a: any, b: any) => a.position - b.position) })) ?? [])
    setLoading(false)
  }

  async function saveCourse() {
    setSaving(true)
    const { error } = await supabase.from('ec_courses').update({
      title: course.title, description: course.description, cover_url: course.cover_url || null
    }).eq('id', courseId)
    if (error) toast.error('Error al guardar'); else toast.success('Curso guardado ✅')
    setSaving(false)
  }

  async function togglePublish() {
    const newVal = !course.is_published
    await supabase.from('ec_courses').update({ is_published: newVal }).eq('id', courseId)
    setCourse((c: any) => ({ ...c, is_published: newVal }))
    toast.success(newVal ? '🎉 Curso publicado — ya visible para miembros' : 'Curso despublicado')
  }

  async function addModule() {
    if (!newModTitle.trim()) return
    const { data, error } = await supabase.from('ec_course_modules').insert({ course_id: courseId, title: newModTitle.trim(), position: modules.length }).select().single()
    if (error) { toast.error('Error'); return }
    setModules([...modules, { ...data, lessons: [] }])
    setNewModTitle('')
    setExpandedMod(data.id)
  }

  async function deleteModule(modId: string) {
    if (!confirm('¿Eliminar módulo y todas sus lecciones?')) return
    await supabase.from('ec_course_modules').delete().eq('id', modId)
    setModules(modules.filter(m => m.id !== modId))
    toast.success('Módulo eliminado')
  }

  async function addLesson(modId: string) {
    const nl = newLesson[modId]
    if (!nl?.title?.trim()) return
    const mod = modules.find(m => m.id === modId)
    const { data, error } = await supabase.from('ec_course_lessons').insert({
      module_id: modId,
      title: nl.title.trim(),
      video_url: nl.video_url?.trim() || null,
      content: nl.content?.trim() || null,
      duration_min: parseInt(nl.duration_min) || null,
      position: (mod?.lessons?.length ?? 0),
    }).select().single()
    if (error) { toast.error('Error: ' + error.message); return }
    setModules(modules.map(m => m.id === modId ? { ...m, lessons: [...(m.lessons ?? []), data] } : m))
    setNewLesson(p => ({ ...p, [modId]: { title: '', video_url: '', content: '', duration_min: '' } }))
    toast.success('Lección agregada ✅')
  }

  async function saveLesson() {
    if (!editLesson) return
    await supabase.from('ec_course_lessons').update({
      title: editLesson.title,
      video_url: editLesson.video_url || null,
      content: editLesson.content || null,
      duration_min: parseInt(editLesson.duration_min) || null,
    }).eq('id', editLesson.id)
    setModules(modules.map(m => ({
      ...m,
      lessons: m.lessons.map((l: any) => l.id === editLesson.id ? { ...l, ...editLesson } : l)
    })))
    setEditLesson(null)
    toast.success('Lección guardada ✅')
  }

  async function deleteLesson(modId: string, lessonId: string) {
    if (!confirm('¿Eliminar esta lección?')) return
    await supabase.from('ec_course_lessons').delete().eq('id', lessonId)
    setModules(modules.map(m => m.id === modId ? { ...m, lessons: m.lessons.filter((l: any) => l.id !== lessonId) } : m))
  }

  const setNL = (modId: string, key: string, val: string) =>
    setNewLesson(p => ({ ...p, [modId]: { ...(p[modId] ?? { title: '', video_url: '', content: '', duration_min: '' }), [key]: val } }))

  if (loading) return <div style={{ padding: 32, color: C.muted, fontSize: 14 }}>Cargando...</div>

  const totalLessons = modules.reduce((s, m) => s + (m.lessons?.length ?? 0), 0)

  return (
    <div style={{ padding: 28, maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/creator/cursos" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 12 }}>
            <ArrowLeft size={13} /> Volver
          </Link>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, letterSpacing: '-0.04em', color: C.text, marginBottom: 2 }}>{course.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: C.muted }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: course.is_published ? C.green : C.muted, display: 'inline-block' }} />
                {course.is_published ? 'Publicado' : 'Borrador'}
              </span>
              <span>·</span>
              <span>{modules.length} módulos · {totalLessons} lecciones</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={togglePublish} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: course.is_published ? C.red : C.green, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {course.is_published ? <><EyeOff size={13} /> Despublicar</> : <><Eye size={13} /> Publicar</>}
          </button>
          <button onClick={saveCourse} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            <Save size={13} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Course info */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={L}>Título del curso</label>
          <input value={course.title} onChange={e => setCourse((c: any) => ({ ...c, title: e.target.value }))} style={INP} />
        </div>
        <div>
          <label style={L}>Descripción</label>
          <textarea value={course.description ?? ''} onChange={e => setCourse((c: any) => ({ ...c, description: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} placeholder="¿Qué aprenderán los estudiantes?" />
        </div>
        <div>
          <label style={L}>URL de portada (imagen)</label>
          <input value={course.cover_url ?? ''} onChange={e => setCourse((c: any) => ({ ...c, cover_url: e.target.value }))} style={INP} placeholder="https://..." />
          {course.cover_url && <div style={{ marginTop: 8, height: 100, borderRadius: 10, overflow: 'hidden' }}><img src={course.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        </div>
      </div>

      {/* Modules */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>Contenido del curso</h2>
          <span style={{ fontSize: 12, color: C.muted }}>{modules.length} módulos · {totalLessons} lecciones</span>
        </div>

        {modules.map((mod) => (
          <div key={mod.id} style={{ borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', cursor: 'pointer', background: expandedMod === mod.id ? 'rgba(124,58,237,0.05)' : 'transparent' }}
              onClick={() => setExpandedMod(expandedMod === mod.id ? null : mod.id)}>
              {expandedMod === mod.id ? <ChevronDown size={14} color={C.muted} /> : <ChevronRight size={14} color={C.muted} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{mod.title}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{mod.lessons?.length ?? 0} lecciones</div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteModule(mod.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 6, display: 'flex', opacity: 0.6 }}>
                <Trash2 size={13} />
              </button>
            </div>

            {expandedMod === mod.id && (
              <div style={{ background: '#0A0A10', borderTop: `1px solid ${C.border}`, padding: '8px 14px 16px' }}>
                {/* Lessons list */}
                {mod.lessons?.map((lesson: any) => (
                  <div key={lesson.id}>
                    {editLesson?.id === lesson.id ? (
                      <div style={{ background: C.bg1, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input value={editLesson.title} onChange={e => setEditLesson((l: any) => ({ ...l, title: e.target.value }))} style={{ ...INP, fontSize: 13, padding: '9px 12px' }} placeholder="Título" />
                          <input value={editLesson.video_url ?? ''} onChange={e => setEditLesson((l: any) => ({ ...l, video_url: e.target.value }))} style={{ ...INP, fontSize: 13, padding: '9px 12px' }} placeholder="URL del video (YouTube, Vimeo...)" />
                          {editLesson.video_url && getVideoThumb(editLesson.video_url) && (
                            <img src={getVideoThumb(editLesson.video_url)!} alt="" style={{ height: 80, objectFit: 'cover', borderRadius: 8, width: '100%' }} />
                          )}
                          <textarea value={editLesson.content ?? ''} onChange={e => setEditLesson((l: any) => ({ ...l, content: e.target.value }))} rows={2} style={{ ...INP, fontSize: 12, padding: '9px 12px', resize: 'vertical' }} placeholder="Notas de la lección (opcional)" />
                          <input type="number" value={editLesson.duration_min ?? ''} onChange={e => setEditLesson((l: any) => ({ ...l, duration_min: e.target.value }))} style={{ ...INP, fontSize: 13, padding: '9px 12px' }} placeholder="Duración en minutos" />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={saveLesson} style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Guardar</button>
                            <button onClick={() => setEditLesson(null)} style={{ padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: C.muted, border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 4, background: C.bg2, cursor: 'pointer' }}
                        onClick={() => setEditLesson({ ...lesson })}>
                        <div style={{ width: 50, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {lesson.video_url && getVideoThumb(lesson.video_url)
                            ? <img src={getVideoThumb(lesson.video_url)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Play size={14} color={C.purple2} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
                          {lesson.video_url && <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.video_url}</div>}
                          {lesson.duration_min && <div style={{ fontSize: 10, color: C.muted }}>{lesson.duration_min} min</div>}
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteLesson(mod.id, lesson.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, borderRadius: 6, display: 'flex', opacity: 0.6 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add lesson */}
                <div style={{ background: C.bg1, borderRadius: 14, padding: 14, marginTop: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>+ Nueva lección</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input value={newLesson[mod.id]?.title ?? ''} onChange={e => setNL(mod.id, 'title', e.target.value)} placeholder="Título de la lección *" style={{ ...INP, fontSize: 12, padding: '9px 12px' }} />
                    <div style={{ position: 'relative' }}>
                      <input value={newLesson[mod.id]?.video_url ?? ''} onChange={e => setNL(mod.id, 'video_url', e.target.value)} placeholder="URL del video — YouTube, Vimeo, o enlace directo" style={{ ...INP, fontSize: 12, padding: '9px 12px 9px 36px' }} />
                      <Video size={13} color={C.muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {newLesson[mod.id]?.video_url && getVideoThumb(newLesson[mod.id].video_url) && (
                      <img src={getVideoThumb(newLesson[mod.id].video_url)!} alt="" style={{ height: 70, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
                      <textarea value={newLesson[mod.id]?.content ?? ''} onChange={e => setNL(mod.id, 'content', e.target.value)} placeholder="Notas (opcional)" rows={2} style={{ ...INP, fontSize: 12, padding: '9px 12px', resize: 'none' }} />
                      <input type="number" value={newLesson[mod.id]?.duration_min ?? ''} onChange={e => setNL(mod.id, 'duration_min', e.target.value)} placeholder="Min" style={{ ...INP, fontSize: 12, padding: '9px 12px' }} />
                    </div>
                    <button onClick={() => addLesson(mod.id)} disabled={!newLesson[mod.id]?.title?.trim()} style={{ padding: '9px', borderRadius: 10, background: newLesson[mod.id]?.title?.trim() ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)', color: newLesson[mod.id]?.title?.trim() ? C.purple2 : C.muted, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                      + Agregar lección
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add module */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={newModTitle} onChange={e => setNewModTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addModule()} placeholder="Nombre del nuevo módulo..." style={{ ...INP, flex: 1 }} />
            <button onClick={addModule} disabled={!newModTitle.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', borderRadius: 12, background: newModTitle.trim() ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'rgba(255,255,255,0.06)', color: newModTitle.trim() ? '#fff' : C.muted, border: 'none', cursor: newModTitle.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
              <Plus size={14} /> Módulo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
