'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const C = { bg: 'var(--bg)', bg1: 'var(--bg1)', bg2: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', muted2: 'var(--muted2)', green: '#00D68F' }

interface Props {
  lesson: any
  courseId: string
  userId: string
  nextLesson?: any
  isCompleted: boolean
  accentColor: string
}

function getYoutubeId(url: string) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export default function LessonPlayer({ lesson, courseId, userId, nextLesson, isCompleted: initialCompleted, accentColor }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [marking, setMarking] = useState(false)

  const youtubeId = lesson.video_url ? getYoutubeId(lesson.video_url) : null
  const vimeoId = lesson.video_url ? getVimeoId(lesson.video_url) : null

  async function markComplete() {
    if (completed) return
    setMarking(true)
    const { error } = await supabase.from('ec_lesson_progress').upsert({
      lesson_id: lesson.id,
      user_id: userId,
      completed_at: new Date().toISOString(),
      progress_pct: 100,
    }, { onConflict: 'lesson_id,user_id' })
    if (!error) {
      setCompleted(true)
      toast.success('¡Lección completada! ✅')
      router.refresh()
    }
    setMarking(false)
  }

  async function markAndNext() {
    await markComplete()
    if (nextLesson) {
      router.push(`/cursos/${courseId}?lesson=${nextLesson.id}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Video */}
      <div style={{ background: '#000', position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '60vh', flexShrink: 0 }}>
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?color=${accentColor.replace('#', '')}&title=0&byline=0`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : lesson.video_url ? (
          <video src={lesson.video_url} controls style={{ width: '100%', height: '100%' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg1)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <p style={{ color: C.muted, fontSize: 14 }}>Esta lección no tiene video</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson info */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 22, letterSpacing: '-0.04em', color: C.text, marginBottom: 6 }}>
              {lesson.title}
            </h1>
            {lesson.duration_min && (
              <span style={{ fontSize: 12, color: C.muted }}>{lesson.duration_min} minutos</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {completed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.3)', color: C.green, fontSize: 13, fontWeight: 700 }}>
                <CheckCircle size={15} /> Completada
              </div>
            ) : (
              <button onClick={markComplete} disabled={marking} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'var(--border)', border: `1px solid ${C.border}`, color: C.muted2, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <CheckCircle size={15} /> {marking ? 'Marcando...' : 'Marcar como vista'}
              </button>
            )}
            {nextLesson && (
              <button onClick={markAndNext} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13 }}>
                Siguiente <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {lesson.content && (
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 }}>Notas de la lección</h3>
            <div style={{ fontSize: 14, color: C.muted2, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{lesson.content}</div>
          </div>
        )}

        {/* Attachments */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginTop: 16 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>Recursos descargables</h3>
            {lesson.attachments.map((att: any, i: number) => (
              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: C.bg2, textDecoration: 'none', marginBottom: 8, color: C.text, fontSize: 13 }}>
                📎 {att.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
