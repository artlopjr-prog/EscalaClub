import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Award, Download } from 'lucide-react'
import Link from 'next/link'

const C = { bg: 'var(--bg)', bg1: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', purple: '#7C3AED', purple2: '#9F67FF', gold: '#F0A500', green: '#00D68F' }

export default async function CertificadoPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('ec_profiles').select('display_name').eq('id', user.id).single()
  const { data: course } = await supabase.from('ec_courses').select('title, community_id').eq('id', courseId).single()

  // Check if user completed the course
  const { data: modules } = await supabase.from('ec_course_modules').select('id, lessons:ec_course_lessons(id)').eq('course_id', courseId)
  const allLessonIds = modules?.flatMap(m => (m.lessons as any[]).map((l: any) => l.id)) ?? []
  const { data: progress } = await supabase.from('ec_lesson_progress').select('lesson_id').eq('user_id', user.id).not('completed_at', 'is', null)
  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
  const isCompleted = allLessonIds.length > 0 && allLessonIds.every(id => completedIds.has(id))

  if (!isCompleted) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 24, color: C.text, marginBottom: 12 }}>Curso no completado</h2>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: 24 }}>Completa todas las lecciones para obtener tu certificado.</p>
        <Link href={`/cursos/${courseId}`} style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>
          Continuar curso
        </Link>
      </div>
    )
  }

  const issuedDate = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: C.text, marginBottom: 28 }}>🎓 Tu certificado</h1>

      {/* Certificate */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg1), var(--bg2))', border: '2px solid rgba(240,165,0,0.3)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative corners */}
        <div style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderTop: '3px solid rgba(240,165,0,0.4)', borderLeft: '3px solid rgba(240,165,0,0.4)', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderTop: '3px solid rgba(240,165,0,0.4)', borderRight: '3px solid rgba(240,165,0,0.4)', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 16, width: 40, height: 40, borderBottom: '3px solid rgba(240,165,0,0.4)', borderLeft: '3px solid rgba(240,165,0,0.4)', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 40, height: 40, borderBottom: '3px solid rgba(240,165,0,0.4)', borderRight: '3px solid rgba(240,165,0,0.4)', borderRadius: '0 0 4px 0' }} />

        <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', color: C.gold, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>Certificado de Completación</div>
        <div style={{ fontSize: 16, color: C.muted, marginBottom: 8 }}>Esto certifica que</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '-0.04em', color: C.text, marginBottom: 8 }}>{profile?.display_name ?? 'Estudiante'}</h2>
        <div style={{ fontSize: 16, color: C.muted, marginBottom: 8 }}>ha completado exitosamente el curso</div>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 24, color: C.gold, marginBottom: 24, letterSpacing: '-0.03em' }}>{course?.title}</h3>
        <div style={{ width: 120, height: 2, background: 'linear-gradient(90deg, transparent, rgba(240,165,0,0.4), transparent)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 13, color: C.muted }}>Emitido el {issuedDate}</div>
        <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.2)', color: C.green, fontSize: 12, fontWeight: 700 }}>
          ✅ Verificado por EscalaClub
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>
          <Download size={16} /> Descargar / Imprimir
        </button>
      </div>
    </div>
  )
}
