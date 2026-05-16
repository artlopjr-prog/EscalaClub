import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Play, ChevronRight } from 'lucide-react'

export default async function CursosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get my communities first
  const { data: myMemberships } = await supabase
    .from('ec_community_members')
    .select('community_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const communityIds = myMemberships?.map(m => m.community_id) ?? []

  // Get courses from my communities
  let query = supabase.from('ec_courses')
    .select('*, community:ec_communities(id,name,slug,logo_url,primary_color)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (communityIds.length > 0) {
    // Show courses from joined communities + all public courses
    query = query.in('community_id', communityIds)
  }
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: courses } = await query.limit(24)

  // Get lesson progress
  const { data: progressData } = await supabase
    .from('ec_lesson_progress')
    .select('lesson_id, progress_pct, completed_at')
    .eq('user_id', user.id)

  const hasProgress = new Set(progressData?.map(p => p.lesson_id) ?? [])

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.04em', marginBottom: 4 }}>Cursos 📚</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Contenido de tus comunidades</p>
      </div>

      <div style={{ marginBottom: 24, maxWidth: 400, position: 'relative' }}>
        <form method="GET">
          <Search size={14} color="var(--muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input name="q" defaultValue={params.q} placeholder="Buscar cursos..." className="input" style={{ paddingLeft: 38 }} />
        </form>
      </div>

      {courses && courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {courses.map((course: any) => {
            const comm = course.community as any
            return (
              <Link key={course.id} href={`/cursos/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}>

                  {/* Cover */}
                  <div style={{ height: 130, background: course.cover_url ? undefined : `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(0,0,0,0.4))`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {course.cover_url
                      ? <img src={course.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ fontSize: 48 }}>📚</div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(124,58,237,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={17} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '16px' }}>
                    {comm && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: (comm.primary_color ?? '#7C3AED') + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                          {comm.logo_url ? <img src={comm.logo_url} alt="" style={{ width: '100%', borderRadius: 3 }} /> : '🌐'}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>{comm.name}</span>
                      </div>
                    )}
                    <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.3 }}>{course.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {new Date(course.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--purple2)' }}>
                        Ver curso <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sin cursos disponibles</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            {communityIds.length === 0
              ? 'Únete a una comunidad para acceder a sus cursos'
              : 'Las comunidades que sigues aún no tienen cursos publicados'}
          </p>
          <Link href="/comunidades" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Explorar comunidades
          </Link>
        </div>
      )}
    </div>
  )
}
