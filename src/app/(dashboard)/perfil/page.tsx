'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Save, Globe, BookOpen, Award, TrendingUp, Users } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }
const INP: React.CSSProperties = { width: '100%', background: '#13131C', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '12px 16px', color: '#EEEDF5', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif' }
const L: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 8, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }

const COUNTRIES = ['Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Ecuador','El Salvador','Guatemala','Honduras','México','Nicaragua','Panamá','Paraguay','Perú','Puerto Rico','República Dominicana','Uruguay','Venezuela','Otro']

export default function PerfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [communities, setCommunities] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'perfil'|'comunidades'|'cursos'>('perfil')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      const [{ data: p }, { data: comms }, { data: enrs }] = await Promise.all([
        supabase.from('ec_profiles').select('*').eq('id', user.id).single(),
        supabase.from('ec_community_members').select('*, community:ec_communities(id,name,slug,logo_url,primary_color,member_count,access_type)').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('ec_lesson_progress').select('lesson_id, completed_at').eq('user_id', user.id),
      ])
      setProfile(p ?? { id: user.id, display_name: '', bio: '', country: '', avatar_url: '' })
      setCommunities(comms ?? [])
      setEnrollments(enrs ?? [])
      const pts = comms?.reduce((s, m) => s + (m.points ?? 0), 0) ?? 0
      setTotalPoints(pts)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('ec_profiles').update({
      display_name: profile.display_name,
      bio: profile.bio,
      country: profile.country,
      avatar_url: profile.avatar_url,
    }).eq('id', profile.id)
    if (error) toast.error('Error al guardar')
    else toast.success('Perfil actualizado ✅')
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  const completedLessons = enrollments.filter(e => e.completed_at).length
  const level = Math.floor(totalPoints / 100) + 1
  const xpToNext = 100 - (totalPoints % 100)

  return (
    <div style={{ padding: 28, maxWidth: 860, margin: '0 auto' }}>
      {/* Profile header */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: 100, background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(159,103,255,0.1))' }} />
        <div style={{ padding: '0 24px 24px', marginTop: -40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '4px solid #0D0D14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 32, color: C.purple2, overflow: 'hidden', flexShrink: 0 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.display_name?.[0]?.toUpperCase() ?? '?')}
            </div>
            <div style={{ paddingBottom: 4, flex: 1 }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em', color: C.text, marginBottom: 3 }}>{profile?.display_name || 'Sin nombre'}</h1>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{email} {profile?.country && `· ${profile.country}`}</div>
              {profile?.bio && <p style={{ fontSize: 13, color: C.muted2, lineHeight: 1.5 }}>{profile.bio}</p>}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Puntos', value: totalPoints.toLocaleString(), color: C.gold, icon: '⭐' },
              { label: 'Nivel', value: level, color: C.purple2, icon: '🚀' },
              { label: 'Comunidades', value: communities.length, color: '#3B82F6', icon: '🌐' },
              { label: 'Lecciones', value: completedLessons, color: C.green, icon: '📚' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg2, borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 22, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 6 }}>
              <span>Nivel {level}</span>
              <span>{xpToNext} pts para nivel {level + 1}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${100 - xpToNext}%`, height: '100%', background: `linear-gradient(90deg, #7C3AED, #9F67FF)`, borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 4 }}>
        {([['perfil', '⚙️ Editar perfil'], ['comunidades', '🌐 Mis comunidades'], ['cursos', '📚 Mi progreso']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px', borderRadius: 10, background: tab === t ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'transparent', color: tab === t ? '#fff' : C.muted, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'perfil' && (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={L}>Nombre completo</label>
            <input value={profile?.display_name ?? ''} onChange={e => setProfile((p: any) => ({ ...p, display_name: e.target.value }))} placeholder="Tu nombre" style={INP} />
          </div>
          <div>
            <label style={L}>Bio</label>
            <textarea value={profile?.bio ?? ''} onChange={e => setProfile((p: any) => ({ ...p, bio: e.target.value }))} placeholder="Cuéntanos sobre ti..." rows={3} style={{ ...INP, resize: 'vertical' }} />
          </div>
          <div>
            <label style={L}>País</label>
            <select value={profile?.country ?? ''} onChange={e => setProfile((p: any) => ({ ...p, country: e.target.value }))} style={{ ...INP, cursor: 'pointer' }}>
              <option value="">Selecciona tu país</option>
              {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#13131C' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>Foto de perfil</label>
            <ImageUpload
              bucket="avatars"
              folder="profile"
              onUpload={(url) => setProfile((p: any) => ({ ...p, avatar_url: url }))}
              currentUrl={profile?.avatar_url ?? ''}
              rounded={true}
              label="Subir foto"
              maxMB={5}
            />
          </div>
          <div>
            <label style={L}>Email</label>
            <input value={email} disabled style={{ ...INP, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {tab === 'comunidades' && (
        <div>
          {communities.length > 0 ? communities.map((m: any) => {
            const comm = m.community as any
            const accent = comm?.primary_color ?? '#7C3AED'
            return (
              <Link key={m.id} href={`/comunidades/${comm?.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
                <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                    {comm?.logo_url ? <img src={comm.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 3 }}>{comm?.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{comm?.member_count ?? 0} miembros · {m.points ?? 0} pts · {m.role}</div>
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 20, color: accent }}>{m.points ?? 0} pts</div>
                </div>
              </Link>
            )
          }) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Sin comunidades</h3>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Únete a una comunidad para empezar</p>
              <Link href="/comunidades" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14 }}>Explorar comunidades</Link>
            </div>
          )}
        </div>
      )}

      {tab === 'cursos' && (
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>
            {completedLessons > 0 ? `${completedLessons} lecciones completadas` : 'Sin progreso aún'}
          </h3>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>
            {completedLessons > 0 ? '¡Sigue así! Completa más lecciones para ganar puntos.' : 'Únete a un curso para empezar a aprender'}
          </p>
          <Link href="/cursos" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14 }}>Ver cursos disponibles</Link>
        </div>
      )}
    </div>
  )
}
