'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Users, Plus, X } from 'lucide-react'

const CATS = [
  { label: 'Todas', emoji: '🌐' },
  { label: 'Marketing', emoji: '📈' },
  { label: 'Ventas', emoji: '💰' },
  { label: 'IA', emoji: '🤖' },
  { label: 'Emprendimiento', emoji: '🚀' },
  { label: 'Finanzas', emoji: '💵' },
  { label: 'Tecnología', emoji: '💻' },
  { label: 'Fitness', emoji: '💪' },
  { label: 'Liderazgo', emoji: '👑' },
  { label: 'E-commerce', emoji: '🛍️' },
  { label: 'Diseño', emoji: '🎨' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Educación', emoji: '📚' },
  { label: 'Música', emoji: '🎵' },
]

const RANK_BG = [
  'linear-gradient(135deg,#E9A020,#FFCA6B)',
  'linear-gradient(135deg,#9ba8b5,#c8d0d8)',
  'linear-gradient(135deg,#c47c2a,#e8a44a)',
]
const RANK_COLOR = ['#0A0A12', '#1a1a2e', '#fff']

export default function ComunidadesPage() {
  const supabase = createClient()
  const [communities, setCommunities] = useState<any[]>([])
  const [myIds, setMyIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todas')
  const [access, setAccess] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: comms }, { data: memberships }] = await Promise.all([
        supabase
          .from('ec_communities')
          .select('id,name,slug,tagline,category,access_type,price_monthly,primary_color,logo_url,banner_url,member_count,owner_id,owner:ec_profiles!ec_communities_owner_id_fkey(display_name,avatar_url)')
          .eq('status', 'active')
          .order('member_count', { ascending: false })
          .limit(60),
        user
          ? supabase.from('ec_community_members').select('community_id').eq('user_id', user.id).eq('status', 'active')
          : Promise.resolve({ data: [] }),
      ])
      setCommunities(comms ?? [])
      setMyIds(new Set(memberships?.map((m: any) => m.community_id) ?? []))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = communities.filter(c => {
    const matchQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.tagline ?? '').toLowerCase().includes(q.toLowerCase())
    const matchCat = cat === 'Todas' || (c.category ?? '').toLowerCase().includes(cat.toLowerCase())
    const matchAccess = access === 'all'
      || (access === 'free' ? (!c.price_monthly || c.price_monthly === 0) : (c.price_monthly ?? 0) > 0)
    return matchQ && matchCat && matchAccess
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 48 }}>

      {/* HERO HEADER */}
      <div style={{ background: 'linear-gradient(180deg,var(--bg1) 0%,var(--bg) 100%)', borderBottom: '1px solid var(--border)', padding: '36px 32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>EscalaClub</p>
          <h1 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 'clamp(26px,5vw,42px)', letterSpacing: '-.04em', marginBottom: 6 }}>
            Descubre comunidades
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 22 }}>
            {loading ? 'Cargando...' : `${filtered.length} comunidades de los mejores creadores de LATAM`}
          </p>

          {/* Buscador grande */}
          <div style={{ position: 'relative', maxWidth: 540, marginBottom: 20 }}>
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Busca por nombre, tema o creador..."
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '13px 16px 13px 46px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
            {q && (
              <button onClick={() => setQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Categorías */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {CATS.map(c => (
              <button key={c.label} onClick={() => setCat(c.label)} style={{
                padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                background: cat === c.label ? 'linear-gradient(135deg,#7B5EF8,#A78BFF)' : 'var(--bg2)',
                color: cat === c.label ? '#fff' : 'var(--muted2)',
                border: `1px solid ${cat === c.label ? 'transparent' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all .15s', fontFamily: 'Inter,sans-serif',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 0' }}>

        {/* Filtros acceso */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
            {[{ val: 'all', label: 'Todas' }, { val: 'free', label: 'Gratis' }, { val: 'paid', label: 'De pago' }].map(a => (
              <button key={a.val} onClick={() => setAccess(a.val)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: access === a.val ? 'var(--bg3)' : 'transparent',
                color: access === a.val ? 'var(--text)' : 'var(--muted)',
                border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              }}>{a.label}</button>
            ))}
          </div>
          <Link href="/creator/comunidad" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#7B5EF8,#A78BFF)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 14px rgba(123,94,248,0.3)' }}>
            <Plus size={13} /> Crear mi comunidad
          </Link>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: 'var(--bg1)', borderRadius: 20, height: 280, border: '1px solid var(--border)', opacity: .5 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sin resultados</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Intenta con otros términos o categoría</p>
            <button onClick={() => { setQ(''); setCat('Todas'); setAccess('all') }}
              style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(123,94,248,0.12)', color: '#A78BFF', border: '1px solid rgba(123,94,248,0.3)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif' }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {filtered.map((c, idx) => {
              const isMember = myIds.has(c.id)
              const isFree = !c.price_monthly || c.price_monthly === 0
              const accent = c.primary_color ?? '#7B5EF8'
              const owner = c.owner as any
              const initials = (owner?.display_name ?? '').slice(0, 2).toUpperCase()

              return (
                <Link key={c.id} href={`/comunidades/${c.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    background: 'var(--bg1)',
                    border: `1px solid ${isMember ? accent + '44' : 'var(--border)'}`,
                    borderRadius: 20, overflow: 'hidden', cursor: 'pointer', height: '100%',
                    transition: 'border-color .2s,transform .18s,box-shadow .2s',
                  }}>

                    {/* COVER */}
                    <div style={{ height: 165, background: c.banner_url ? undefined : `linear-gradient(135deg,${accent}44,${accent}11)`, position: 'relative', overflow: 'hidden' }}>
                      {c.banner_url && <img src={c.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 25%,rgba(6,6,10,0.88) 100%)' }} />

                      {/* Ranking badge */}
                      {idx < 3 && (
                        <div style={{ position: 'absolute', top: 10, left: 10, width: 28, height: 28, borderRadius: 8, background: RANK_BG[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 12, color: RANK_COLOR[idx], boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                          #{idx + 1}
                        </div>
                      )}

                      {/* Badges derecha */}
                      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
                        {isMember && (
                          <div style={{ padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D68F' }} />
                            <span style={{ fontSize: 9, fontFamily: 'Inter,sans-serif', fontWeight: 700, color: '#00D68F' }}>Miembro</span>
                          </div>
                        )}
                        <div style={{ padding: '3px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: 700, color: isFree ? '#00D68F' : accent }}>
                          {isFree ? 'GRATIS' : `$${c.price_monthly}/mes`}
                        </div>
                      </div>

                      {/* Logo superpuesto */}
                      <div style={{ position: 'absolute', bottom: -18, left: 16, zIndex: 2 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, border: '3px solid var(--bg1)', background: c.logo_url ? undefined : accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' }}>
                          {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
                        </div>
                      </div>
                    </div>

                    {/* BODY */}
                    <div style={{ padding: '24px 16px 16px' }}>
                      <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: '-.03em', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </h3>
                      {c.tagline && (
                        <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                          {c.tagline}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(135deg,${accent},${accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                            {owner?.avatar_url ? <img src={owner.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials || '👤'}
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {owner?.display_name ?? 'Creador'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 11, flexShrink: 0 }}>
                          <Users size={11} />
                          <span style={{ fontWeight: 600, color: 'var(--muted2)' }}>{(c.member_count ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                      {c.category && (
                        <div style={{ marginTop: 10 }}>
                          <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 99, background: `${accent}15`, color: accent, fontWeight: 600, border: `1px solid ${accent}25` }}>
                            {c.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
