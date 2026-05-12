'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, BookOpen, Eye, EyeOff, ChevronRight } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

export default function CreatorCursosPage() {
  const supabase = createClient()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: comm } = await supabase.from('ec_communities').select('id').eq('owner_id', user.id).maybeSingle()
      if (!comm) { setLoading(false); return }
      const { data } = await supabase.from('ec_courses').select('*').eq('community_id', comm.id).order('created_at', { ascending: false })
      setCourses(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const published = courses.filter(c => c.is_published).length

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em', color: C.text, marginBottom: 6 }}>Mis Cursos</h1>
          <p style={{ fontSize: 13, color: C.muted }}>{published} publicados · {courses.length - published} borradores · 0 estudiantes totales</p>
        </div>
        <Link href="/creator/cursos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
          <Plus size={16} /> Nuevo curso
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Cursos creados', value: courses.length, color: C.purple2 },
          { label: 'Publicados', value: published, color: C.green },
          { label: 'Estudiantes', value: 0, color: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 32, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {courses.length > 0 ? (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {courses.map((course, i) => (
            <Link key={course.id} href={`/creator/cursos/${course.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < courses.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📚</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{new Date(course.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, background: course.is_published ? 'rgba(0,214,143,0.12)' : 'rgba(255,255,255,0.06)', color: course.is_published ? C.green : C.muted, fontSize: 11, fontWeight: 700 }}>
                  {course.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                  {course.is_published ? 'Publicado' : 'Borrador'}
                </div>
                <ChevronRight size={15} color={C.muted} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 8 }}>Sin cursos aún</h3>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Crea tu primer curso y empieza a monetizar tu conocimiento</p>
          <Link href="/creator/cursos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
            <Plus size={16} /> Crear mi primer curso
          </Link>
        </div>
      )}
    </div>
  )
}
