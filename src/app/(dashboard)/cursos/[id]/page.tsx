import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Lock, CheckCircle, Clock, BookOpen, Users } from 'lucide-react'
import LessonPlayer from './LessonPlayer'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F' }

export default async function CursoPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lesson?: string }> }) {
  const { id } = await params
  const { lesson: lessonId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('ec_courses')
    .select('*, community:ec_communities(id,name,slug,owner_id,primary_color)')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const community = course.community as any
  const isOwner = community?.owner_id === user.id

  // Check membership
  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('id')
    .eq('community_id', community?.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const hasAccess = isOwner || !!membership

  const { data: modules } = await supabase
    .from('ec_course_modules')
    .select('*, lessons:ec_course_lessons(*)')
    .eq('course_id', id)
    .order('position')

  const allLessons = modules?.flatMap(m => (m.lessons ?? []).sort((a: any, b: any) => a.position - b.position)) ?? []
  const currentLesson = lessonId ? allLessons.find((l: any) => l.id === lessonId) : allLessons[0]

  const { data: progressData } = await supabase
    .from('ec_lesson_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', user.id)

  const completedIds = new Set(progressData?.filter(p => p.completed_at).map(p => p.lesson_id) ?? [])
  const progressPct = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0

  const accentColor = community?.primary_color ?? '#7C3AED'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg }}>
      {/* Sidebar — course outline */}
      <aside style={{ width: 300, background: C.bg1, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 0', borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
          <Link href="/cursos" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted, textDecoration: 'none', marginBottom: 12 }}>
            <ArrowLeft size={12} /> Volver a cursos
          </Link>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '-0.03em', color: C.text, marginBottom: 8, lineHeight: 1.3 }}>{course.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap', fontWeight: 600 }}>{progressPct}%</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{completedIds.size}/{allLessons.length} lecciones completadas</div>
        </div>

        {/* Modules list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {modules?.map((mod: any) => (
            <div key={mod.id}>
              <div style={{ padding: '10px 16px 6px', fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {mod.title}
              </div>
              {(mod.lessons ?? []).sort((a: any, b: any) => a.position - b.position).map((lesson: any) => {
                const isActive = lesson.id === currentLesson?.id
                const isCompleted = completedIds.has(lesson.id)
                const isLocked = !hasAccess
                return (
                  <Link key={lesson.id} href={isLocked ? '#' : `/cursos/${id}?lesson=${lesson.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: isActive ? `${accentColor}15` : 'transparent', borderLeft: isActive ? `3px solid ${accentColor}` : '3px solid transparent', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ flexShrink: 0 }}>
                        {isLocked ? <Lock size={13} color={C.muted} /> : isCompleted ? <CheckCircle size={13} color={C.green} /> : <Play size={13} color={isActive ? accentColor : C.muted} fill={isActive ? accentColor : 'none'} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? C.text : isCompleted ? C.muted2 : C.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                          {lesson.title}
                        </div>
                        {lesson.duration_min && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{lesson.duration_min} min</div>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {hasAccess && currentLesson ? (
          <LessonPlayer
            lesson={currentLesson}
            courseId={id}
            userId={user.id}
            nextLesson={allLessons[allLessons.findIndex((l: any) => l.id === currentLesson.id) + 1]}
            isCompleted={completedIds.has(currentLesson.id)}
            accentColor={accentColor}
          />
        ) : !hasAccess ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, color: C.text, marginBottom: 12 }}>Contenido exclusivo</h2>
              <p style={{ fontSize: 15, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>Únete a la comunidad para acceder a este curso y todo su contenido.</p>
              <Link href={`/comunidades/${community?.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: '#fff', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15 }}>
                Unirse a {community?.name}
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <p style={{ color: C.muted, fontSize: 14 }}>Este curso no tiene lecciones aún</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
