'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Users, X } from 'lucide-react'
import { KomunioLogo } from '@/components/KomunioLogo'

const CATS = [
  { label: 'Todas', emoji: '\u{1F30D}' },
  { label: 'Marketing', emoji: '\u{1F4C8}' },
  { label: 'Ventas', emoji: '\u{1F4B0}' },
  { label: 'IA', emoji: '\u{1F916}' },
  { label: 'Emprendimiento', emoji: '\u{1F680}' },
  { label: 'Finanzas', emoji: '\u{1F4B5}' },
  { label: 'Tecnología', emoji: '\u{1F4BB}' },
  { label: 'Fitness', emoji: '\u{1F4AA}' },
  { label: 'Liderazgo', emoji: '\u{1F451}' },
  { label: 'E-commerce', emoji: '\u{1F6CD}\uFE0F' },
  { label: 'Diseño', emoji: '\u{1F3A8}' },
  { label: 'Gaming', emoji: '\u{1F3AE}' },
  { label: 'Educación', emoji: '\u{1F4DA}' },
  { label: 'Música', emoji: '\u{1F3B5}' },
]

const RANK_BG = [
  'linear-gradient(135deg,#E9A020,#FFCA6B)',
  'linear-gradient(135deg,#9ba8b5,#c8d0d8)',
  'linear-gradient(135deg,#c47c2a,#e8a44a)',
]
const RANK_COLOR = ['var(--bg)', '#1a1a2e', '#fff']

export default function HomePage() {
  const supabase = createClient()
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todas')
  const [access, setAccess] = useState('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Track affiliate referral
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('komunio_ref', ref)
      // Track click
      fetch('/api/affiliates/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref })
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      const { data: comms } = await supabase
        .from('ec_communities')
        .select('id,name,slug,tagline,category,access_type,price_monthly,primary_color,logo_url,banner_url,member_count,owner:ec_profiles!ec_communities_owner_id_fkey(display_name,avatar_url)')
        .eq('status', 'active')
        .order('member_count', { ascending: false })
        .limit(60)
      setCommunities(comms ?? [])
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <KomunioLogo size={32} variant="full" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,var(--purple),var(--purple2))', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif' }}>
                Mi dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ padding: '8px 16px', borderRadius: 10, color: 'var(--muted2)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Entrar</Link>
                <Link href="/registro" style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,var(--purple),var(--purple2))', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 14px rgba(123,94,248,0.3)' }}>Registrarme</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg,var(--bg1) 0%,var(--bg) 100%)', borderBottom: '1px solid var(--border)', padding: '40px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple2)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>La plataforma de comunidades de LATAM</p>
            <h1 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: 'clamp(28px,6vw,52px)', letterSpacing: '-.04em', lineHeight: 1.05, marginBottom: 10 }}>Descubre comunidades</h1>
            <p style={{ fontSize: 15, color: 'var(--muted2)', maxWidth: 460, margin: '0 auto' }}>
              {loading ? 'Cargando...' : `${filtered.length} comunidades · Únete gratis o con membresía`}
            </p>
          </div>
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto 20px' }}>
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Busca por nombre, tema, creador..."
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, padding: '14px 16px 14px 46px', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
            {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}><X size={14} /></button>}
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', justifyContent: 'center', flexWrap: 'wrap' }}>
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
            {[{ val: 'all', label: 'Todas' }, { val: 'free', label: 'Gratis' }, { val: 'paid', label: 'De pago' }].map(a => (
              <button key={a.val} onClick={() => setAccess(a.val)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: access === a.val ? 'var(--bg3)' : 'transparent', color: access === a.val ? 'var(--text)' : 'var(--muted)', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>{a.label}</button>
            ))}
          </div>
          <Link href="/registro" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#7B5EF8,#A78BFF)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 14px rgba(123,94,248,0.3)' }}>
            Crear mi comunidad gratis
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 20 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sin resultados</h3>
            <button onClick={() => { setQ(''); setCat('Todas'); setAccess('all') }} style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(123,94,248,0.12)', color: '#A78BFF', border: '1px solid rgba(123,94,248,0.3)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', marginTop: 12 }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {filtered.map((c, idx) => {
              const isFree = !c.price_monthly || c.price_monthly === 0
              const accent = c.primary_color ?? '#7B5EF8'
              const owner = c.owner as any
              const initials = (owner?.display_name ?? '').slice(0,2).toUpperCase()
              return (
                <Link key={c.id} href={`/comunidades/${c.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', height: '100%', transition: 'transform .18s, box-shadow .2s' }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-3px)'; el.style.boxShadow=`0 12px 40px rgba(0,0,0,0.4),0 0 0 1px ${accent}33` }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='' }}>
                    <div style={{ height: 170, background: c.banner_url?undefined:`linear-gradient(135deg,${accent}44,${accent}11)`, position: 'relative', overflow: 'hidden' }}>
                      {c.banner_url && <img src={c.banner_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 25%,rgba(6,6,10,0.88) 100%)' }} />
                      {idx < 3 && (
                        <div style={{ position:'absolute', top:10, left:10, width:28, height:28, borderRadius:8, background:RANK_BG[idx], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:12, color:RANK_COLOR[idx], boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
                          #{idx+1}
                        </div>
                      )}
                      <div style={{ position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:99, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', fontSize:11, fontFamily:'Inter,sans-serif', fontWeight:700, color:isFree?'#00D68F':accent }}>
                        {isFree?'GRATIS':`$${c.price_monthly}/mes`}
                      </div>
                      <div style={{ position:'absolute', bottom:-18, left:16, zIndex:2 }}>
                        <div style={{ width:46, height:46, borderRadius:13, border:'3px solid var(--bg1)', background:c.logo_url?undefined:accent+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, overflow:'hidden', boxShadow:'0 4px 14px rgba(0,0,0,0.5)' }}>
                          {c.logo_url?<img src={c.logo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />:'🌐'}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding:'24px 16px 16px' }}>
                      <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:15, letterSpacing:'-.03em', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</h3>
                      {c.tagline && <p style={{ fontSize:12, color:'var(--muted2)', marginBottom:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.4 }}>{c.tagline}</p>}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
                          <div style={{ width:20, height:20, borderRadius:'50%', background:`linear-gradient(135deg,${accent},${accent}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff', overflow:'hidden', flexShrink:0 }}>
                            {owner?.avatar_url?<img src={owner.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />:initials||'👤'}
                          </div>
                          <span style={{ fontSize:11, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{owner?.display_name??'Creador'}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--muted)', fontSize:11, flexShrink:0 }}>
                          <Users size={11} />
                          <span style={{ fontWeight:600, color:'var(--muted2)' }}>{(c.member_count??0).toLocaleString()}</span>
                        </div>
                      </div>
                      {c.category && <div style={{ marginTop:10 }}><span style={{ fontSize:10, padding:'3px 9px', borderRadius:99, background:`${accent}15`, color:accent, fontWeight:600, border:`1px solid ${accent}25` }}>{c.category}</span></div>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 48, textAlign: 'center', padding: '32px 24px', background: 'linear-gradient(135deg,rgba(123,94,248,0.08),rgba(123,94,248,0.03))', border: '1px solid rgba(123,94,248,0.15)', borderRadius: 20 }}>
            <p style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>¿Quieres crear tu propia comunidad?</p>
            <p style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 18 }}>Sin comisiones · Con PayPal · En español · Para LATAM</p>
            <Link href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#7B5EF8,#A78BFF)', color: '#fff', textDecoration: 'none', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(123,94,248,0.35)' }}>
              Crear mi comunidad gratis
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
