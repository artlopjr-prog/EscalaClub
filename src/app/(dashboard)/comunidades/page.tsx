'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Users, Plus, ChevronRight, X, SlidersHorizontal } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

const CATS = ['Todas','Marketing Digital','Ventas','IA','Emprendimiento','Liderazgo','Finanzas','Tecnología','E-commerce','Personal Branding','Fitness','Gaming','Otro']
const ACCESS = [{ val: 'all', label: 'Todas' }, { val: 'free', label: 'Gratis' }, { val: 'paid', label: 'De pago' }]

export default function ComunidadesPage() {
  const supabase = createClient()
  const [communities, setCommunities] = useState<any[]>([])
  const [myMemberIds, setMyMemberIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todas')
  const [access, setAccess] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: comms }, { data: memberships }] = await Promise.all([
        supabase.from('ec_communities').select('*').eq('status', 'active').order('member_count', { ascending: false }).limit(50),
        user ? supabase.from('ec_community_members').select('community_id').eq('user_id', user.id).eq('status', 'active') : Promise.resolve({ data: [] }),
      ])
      setCommunities(comms ?? [])
      setMyMemberIds(new Set(memberships?.map((m: any) => m.community_id) ?? []))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = communities.filter(c => {
    const matchQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.tagline ?? '').toLowerCase().includes(q.toLowerCase()) || (c.description ?? '').toLowerCase().includes(q.toLowerCase())
    const matchCat = cat === 'Todas' || (c.category ?? '').toLowerCase().includes(cat.toLowerCase())
    const matchAccess = access === 'all' || (access === 'public' ? c.access_type === 'public' : c.access_type !== 'free')
    return matchQ && matchCat && matchAccess
  })

  const hasFilters = q || cat !== 'Todas' || access !== 'all'

  function clearFilters() { setQ(''); setCat('Todas'); setAccess('all') }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 34, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>Comunidades 🌐</h1>
          <p style={{ fontSize: 14, color: C.muted }}>{loading ? '...' : `${filtered.length} comunidades disponibles`}</p>
        </div>

      </div>

      {/* Search + filters */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar comunidades por nombre, categoría..." style={{ width: '100%', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px 11px 40px', color: C.text, fontSize: 14, outline: 'none' }} />
            {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2, display: 'flex' }}><X size={14} /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', borderRadius: 12, border: `1px solid ${showFilters ? '#7C3AED' : C.border}`, background: showFilters ? 'rgba(124,58,237,0.1)' : C.bg1, color: showFilters ? C.purple2 : C.muted2, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            <SlidersHorizontal size={15} /> Filtros {hasFilters && <span style={{ background: '#7C3AED', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>!</span>}
          </button>
          {hasFilters && <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '11px 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 12 }}>
            <X size={13} /> Limpiar
          </button>}
        </div>

        {showFilters && (
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Acceso</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {ACCESS.map(a => (
                  <button key={a.val} onClick={() => setAccess(a.val)} style={{ padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif', background: access === a.val ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : C.bg2, color: access === a.val ? '#fff' : C.muted2, border: `1px solid ${access === a.val ? 'transparent' : C.border}`, cursor: 'pointer' }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Categoría</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setCat(c)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: cat === c ? '#7C3AED' : C.bg2, color: cat === c ? '#fff' : C.muted2, border: `1px solid ${cat === c ? '#7C3AED' : C.border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: C.bg1, borderRadius: 20, height: 220, border: `1px solid ${C.border}`, opacity: 0.5 }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {filtered.map(c => {
            const isMember = myMemberIds.has(c.id)
            const isFree = c.access_type === 'public'
            const accent = c.primary_color ?? '#7C3AED'
            return (
              <Link key={c.id} href={`/comunidades/${c.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: C.bg1, border: `1px solid ${isMember ? accent + '44' : C.border}`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer', height: '100%' }}>
                  {/* Banner */}
                  <div style={{ height: 90, background: c.banner_url ? undefined : `linear-gradient(135deg, ${accent}33, ${accent}11)`, position: 'relative', overflow: 'hidden' }}>
                    {c.banner_url && <img src={c.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
                    {isMember && (
                      <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 9px', borderRadius: 99, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
                        <span style={{ fontSize: 9, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: C.green }}>Miembro</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: -16, left: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, border: `3px solid ${C.bg1}`, background: c.logo_url ? undefined : accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden' }}>
                        {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
                      </div>
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '22px 16px 16px' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '-0.03em', color: C.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</h3>
                    {c.tagline && <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.tagline}</p>}
                    {c.category && <div style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: C.muted, fontSize: 10, fontWeight: 500, marginBottom: 10 }}>{c.category}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 11 }}>
                        <Users size={11} /> {(c.member_count ?? 0).toLocaleString()} miembros
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isFree
                          ? <span style={{ fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: C.green }}>Gratis</span>
                          : <span style={{ fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: accent }}>${c.price_monthly}/mes</span>
                        }
                        <ChevronRight size={13} color={C.muted} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 8 }}>Sin resultados</h3>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Intenta con otros términos o {hasFilters && <button onClick={clearFilters} style={{ color: C.purple2, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>limpia los filtros</button>}</p>
          <Link href="/creator/comunidad" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
            <Plus size={14} /> Crear la primera comunidad
          </Link>
        </div>
      )}
    </div>
  )
}
