'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Eye, Plus, Globe, DollarSign, Palette } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ui/ImageUpload'
import { slugify } from '@/lib/utils'

const SUGGESTED_CATS = [
  'Marketing Digital','Ventas','Inteligencia Artificial','Emprendimiento',
  'Liderazgo','Finanzas','Tecnología','Operaciones','E-commerce','Personal Branding',
  'Fitness & Salud','Idiomas','Arte & Diseño','Música','Fotografía','Cocina',
  'Bienes Raíces','Criptomonedas','Desarrollo Personal','Educación','Gaming',
  'Moda','Viajes','Legal','Recursos Humanos','Startups','Coaching','Mindfulness',
]
const COLORS = ['#7C3AED','#EF4444','#F59E0B','#10B981','#3B82F6','#EC4899','#8B5CF6','#06B6D4','#F97316','#84CC16']

interface Community {
  id: string; name: string; slug: string; description: string
  tagline: string; category: string; locale: string
  access_type: string; price_monthly: number; price_yearly: number; paypal_account_email: string
  primary_color: string; logo_url: string; banner_url: string
  member_count: number; status: string
}

const S = {
  page: { padding: '32px', maxWidth: 760, margin: '0 auto' },
  header: { marginBottom: 28 },
  title: { fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: '#EEEDF5', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B6A80' },
  tabs: { display: 'flex', gap: 4, padding: 4, background: '#0D0D14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, width: 'fit-content', marginBottom: 24 },
  tab: (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 9, fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 700,
    background: active ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'transparent',
    color: active ? '#fff' : '#6B6A80', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
  }),
  card: { background: '#0D0D14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px', marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 8, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  required: { color: '#FF4D6A', marginLeft: 2 },
  hint: { fontSize: 11, color: '#6B6A80', marginTop: 5, lineHeight: 1.5 },
  row2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 16 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' },
}

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  creator: 2,
  pro: 5,
}

export default function CreatorComunidadPage() {
  const supabase = createClient()
  const [community, setCommunity] = useState<Community | null>(null)
  const [allCommunities, setAllCommunities] = useState<Community[]>([])
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Community>>({
    name: '', slug: '', description: '', tagline: '', category: 'negocios',
    locale: 'es', access_type: 'public', price_monthly: 0, price_yearly: 0, paypal_account_email: '',
    primary_color: '#7C3AED', logo_url: '', banner_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info'|'pricing'|'appearance'>('info')
  const [userId, setUserId] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [creatorPlan, setCreatorPlan] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(true)
  const [limitMessage, setLimitMessage] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Check if super_admin
    const { data: profile } = await supabase.from('ec_profiles').select('role_platform').eq('id', user.id).maybeSingle()
    const admin = profile?.role_platform === 'super_admin'
    setIsSuperAdmin(admin)

    // Get creator plan
    const { data: sub } = await supabase.from('ec_creator_subscriptions').select('plan').eq('member_id', user.id).eq('status', 'active').maybeSingle()
    setCreatorPlan(sub?.plan ?? null)

    // Get all owned communities
    const { data: communities } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).order('created_at')
    const comms = communities ?? []
    setAllCommunities(comms)

    // Check limits
    if (!admin) {
      if (!sub) {
        setCanCreate(false)
        setLimitMessage('Necesitas un plan activo para crear comunidades.')
      } else {
        const limit = PLAN_LIMITS[sub.plan] ?? 1
        if (comms.length >= limit) {
          setCanCreate(false)
          setLimitMessage(`Tu plan ${sub.plan} permite hasta ${limit} comunidad${limit > 1 ? 'es' : ''}. Sube de plan para crear más.`)
        }
      }
    }

    // Load first community by default
    if (comms.length > 0) {
      const first = comms[0]
      setCommunity(first)
      setForm(first)
      setSelectedCommunityId(first.id)
    }
    setLoading(false)
  }, [supabase])

  // Switch between communities
  function selectCommunity(id: string | null) {
    if (!id) {
      setCommunity(null)
      setForm({ name: '', slug: '', description: '', tagline: '', category: 'negocios', locale: 'es', access_type: 'public', price_monthly: 0, price_yearly: 0, paypal_account_email: '', primary_color: '#7C3AED', logo_url: '', banner_url: '' })
      setSelectedCommunityId(null)
      setTab('info')
    } else {
      const c = allCommunities.find(x => x.id === id)
      if (c) { setCommunity(c); setForm(c); setSelectedCommunityId(id); setTab('info') }
    }
  }

  useEffect(() => { load() }, [load])

  const set = (k: keyof Community, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.name?.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!form.description?.trim()) { toast.error('La descripción es obligatoria'); return }
    setSaving(true)

    if (community) {
      const { error } = await supabase.from('ec_communities').update({
        name: form.name, slug: form.slug, tagline: form.tagline,
        description: form.description, category: form.category, locale: form.locale,
        access_type: form.access_type,
        price_monthly: form.access_type === 'public' || form.access_type === 'free' ? 0 : Number(form.price_monthly),
        price_yearly: form.access_type === 'public' || form.access_type === 'free' ? 0 : Number(form.price_yearly),
        primary_color: form.primary_color,
        logo_url: form.logo_url || null, banner_url: form.banner_url || null,
        paypal_account_email: form.access_type === 'paid' ? (form.paypal_account_email || null) : null,
      }).eq('id', community.id)
      if (error) toast.error('Error: ' + error.message)
      else { toast.success('✅ Comunidad actualizada'); load() }
    } else {
      const { data, error } = await supabase.from('ec_communities').insert({
        owner_id: userId,
        name: form.name, slug: form.slug || slugify(form.name!),
        tagline: form.tagline || null,
        description: form.description,
        category: form.category || 'negocios',
        locale: form.locale || 'es',
        access_type: form.access_type || 'public',
        price_monthly: form.access_type === 'public' || form.access_type === 'free' ? 0 : Number(form.price_monthly),
        price_yearly: 0,
        primary_color: form.primary_color || '#7C3AED',
        paypal_account_email: form.access_type === 'paid' ? (form.paypal_account_email || null) : null,
        currency: 'USD', plan: 'starter', status: 'active',
      }).select().single()
      if (error) toast.error('Error: ' + error.message)
      else { toast.success('🎉 ¡Comunidad creada!'); setCommunity(data); setForm(data) }
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: '#6B6A80', fontSize: 14 }}>Cargando...</div>
    </div>
  )

  const planLimit = isSuperAdmin ? '∞' : creatorPlan ? PLAN_LIMITS[creatorPlan] : 0

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ ...S.header, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={S.title}>Mis comunidades</h1>
          <p style={{ fontSize: 13, color: '#6B6A80' }}>
            {allCommunities.length} de {planLimit} comunidades usadas
            {!isSuperAdmin && creatorPlan && (
              <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', color: '#9F67FF', fontSize: 11, fontWeight: 700 }}>
                Plan {creatorPlan}
              </span>
            )}
            {isSuperAdmin && (
              <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 99, background: 'rgba(240,165,0,0.15)', color: '#F0A500', fontSize: 11, fontWeight: 700 }}>
                ⭐ Super Admin
              </span>
            )}
          </p>
        </div>
        {community && (
          <Link href={`/comunidades/${community.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', fontSize: 12, color: '#9998B0' }}>
            <Eye size={13} /> Ver pública
          </Link>
        )}
      </div>

      {/* Community selector */}
      {allCommunities.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {allCommunities.map(c => (
            <button key={c.id} onClick={() => selectCommunity(c.id)} style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              background: selectedCommunityId === c.id ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'rgba(255,255,255,0.04)',
              color: selectedCommunityId === c.id ? '#fff' : '#9998B0',
              border: `1px solid ${selectedCommunityId === c.id ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
            }}>{c.name}</button>
          ))}
          {(canCreate || isSuperAdmin) && (
            <button onClick={() => selectCommunity(null)} style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              background: selectedCommunityId === null ? 'linear-gradient(135deg, #00D68F, #00b377)' : 'rgba(0,214,143,0.08)',
              color: selectedCommunityId === null ? '#fff' : '#00D68F',
              border: `1px solid ${selectedCommunityId === null ? 'transparent' : 'rgba(0,214,143,0.2)'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}><Plus size={13} /> Nueva comunidad</button>
          )}
        </div>
      )}

      {/* Limit warning */}
      {!canCreate && !isSuperAdmin && selectedCommunityId === null && (
        <div style={{ background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#F0A500', lineHeight: 1.5 }}>⚠️ {limitMessage}</div>
          <Link href="/precios" style={{ padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
            Ver planes →
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div style={S.tabs}>
        {[
          { id: 'info', label: '📋 Información' },
          { id: 'pricing', label: '💰 Precios' },
          { id: 'appearance', label: '🎨 Apariencia' },
        ].map(t => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id as typeof tab)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div style={S.card}>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Nombre de la comunidad <span style={S.required}>*</span></label>
            <input value={form.name ?? ''} onChange={e => { const v = e.target.value; set('name', v); if (!community) { const s = v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim(); set('slug', s); } }}
              placeholder="Ej: Growth Mastery — Marketing con IA" maxLength={80}
              className="input" />
            <div style={{ textAlign: 'right', ...S.hint }}>{(form.name ?? '').length}/80</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Tagline (frase corta)</label>
            <input value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value)}
              placeholder="La comunidad donde los marketers van a crecer" maxLength={120}
              className="input" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>URL de tu comunidad</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ padding: '12px 14px', background: '#1A1A26', border: '1px solid rgba(255,255,255,0.09)', borderRight: 'none', borderRadius: '12px 0 0 12px', fontSize: 12, color: '#6B6A80', whiteSpace: 'nowrap' }}>
                escalaclub.com/comunidades/
              </span>
              <input value={form.slug ?? ''} onChange={e => set('slug', slugify(e.target.value))}
                placeholder="mi-comunidad"
                className="input" style={{ borderRadius: '0 12px 12px 0' }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Descripción <span style={S.required}>*</span></label>
            <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              placeholder="¿Qué hace única a tu comunidad? ¿A quién está dirigida? ¿Qué obtendrán los miembros?"
              maxLength={1500} rows={5} className="input" style={{ resize: 'vertical', minHeight: 120 }} />
            <div style={{ textAlign: 'right', ...S.hint }}>{(form.description ?? '').length}/1500</div>
          </div>

          <div style={S.row2}>
            <div>
              <label style={S.label}>Categoría <span style={{fontSize:10,color:'#6B6A80',fontWeight:400,textTransform:'none'}}>— escribe la tuya</span></label>
              <input
                list="cat-suggestions"
                value={form.category ?? ''}
                onChange={e => set('category', e.target.value)}
                placeholder="Ej: Marketing Digital, Gaming, Cocina..."
                className="input"
              />
              <datalist id="cat-suggestions">
                {SUGGESTED_CATS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label style={S.label}>Idioma</label>
              <select value={form.locale ?? 'es'} onChange={e => set('locale', e.target.value)} className="input">
                <option value="es" style={{ background: '#0D0D14' }}>🇪🇸 Español</option>
                <option value="pt" style={{ background: '#0D0D14' }}>🇧🇷 Português</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pricing */}
      {tab === 'pricing' && (
        <div style={S.card}>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Tipo de acceso</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: 'public', label: '🎁 Gratuita', desc: 'Cualquiera puede unirse sin pagar' },
                { val: 'paid', label: '💎 De pago', desc: 'Los miembros pagan membresía' },
              ].map(opt => (
                <button key={opt.val} onClick={() => set('access_type', opt.val)} style={{
                  flex: 1, padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                  border: `2px solid ${form.access_type === opt.val ? '#7C3AED' : 'rgba(255,255,255,0.09)'}`,
                  background: form.access_type === opt.val ? 'rgba(124,58,237,0.1)' : '#13131C',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#EEEDF5', marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: '#6B6A80' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {form.access_type === 'paid' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Precio mensual (USD) <span style={S.required}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B6A80', fontSize: 15 }}>$</span>
                  <input type="number" value={form.price_monthly ?? ''} onChange={e => set('price_monthly', e.target.value)}
                    placeholder="29" min="1" className="input" style={{ paddingLeft: 28 }} />
                </div>
                <div style={S.hint}>💡 Referencia: comunidades en LATAM cobran entre $19–$99/mes</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Tu email de PayPal <span style={S.required}>*</span></label>
                <input
                  type="email"
                  value={form.paypal_account_email ?? ''}
                  onChange={e => set('paypal_account_email', e.target.value)}
                  placeholder="tu@paypal.com"
                  className="input"
                />
                <div style={S.hint}>💡 Los pagos de tus miembros irán directo a este email de PayPal. Asegúrate de que sea el email de tu cuenta PayPal Business.</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Precio anual (USD) <span style={{ color: '#6B6A80', fontSize: 10, fontWeight: 400 }}>— opcional</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B6A80', fontSize: 15 }}>$</span>
                  <input type="number" value={form.price_yearly ?? ''} onChange={e => set('price_yearly', e.target.value)}
                    placeholder={`${Math.round(Number(form.price_monthly || 29) * 10)} (≈2 meses gratis)`}
                    min="1" className="input" style={{ paddingLeft: 28 }} />
                </div>
              </div>

              {form.price_monthly && (
                <div style={{ padding: '14px 16px', background: '#13131C', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 11, color: '#6B6A80', marginBottom: 6 }}>Preview de tu precio público:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: '#9F67FF' }}>${form.price_monthly}/mes</span>
                    {form.price_yearly && Number(form.price_yearly) > 0 && (
                      <span style={{ fontSize: 11, background: 'rgba(0,214,143,0.12)', color: '#00D68F', padding: '3px 9px', borderRadius: 99 }}>
                        o ${form.price_yearly}/año
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {form.access_type === 'public' || form.access_type === 'free' && (
            <div style={{ padding: '14px 16px', background: 'rgba(0,214,143,0.06)', borderRadius: 12, border: '1px solid rgba(0,214,143,0.2)' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13, color: '#00D68F', marginBottom: 4 }}>✓ Comunidad gratuita</div>
              <div style={{ fontSize: 12, color: '#6B6A80', lineHeight: 1.5 }}>
                Cualquier persona puede unirse. Puedes monetizar con cursos de pago dentro de la comunidad.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Appearance */}
      {tab === 'appearance' && (
        <div style={S.card}>
          {/* Live preview */}
          <div style={{ marginBottom: 24, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ height: 80, background: form.banner_url ? `url(${form.banner_url}) center/cover` : `linear-gradient(135deg, ${form.primary_color ?? '#6366F1'}44, ${form.primary_color ?? '#6366F1'}11)`, position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: -20, left: 16, width: 44, height: 44, borderRadius: 12, background: form.logo_url ? undefined : (form.primary_color ?? '#6366F1') + '30', border: '3px solid #1F2335', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {form.logo_url ? <img src={form.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
              </div>
            </div>
            <div style={{ padding: '28px 16px 12px', background: '#262B42' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#E8E9F0' }}>{form.name || 'Tu comunidad'}</div>
              <div style={{ fontSize: 11, color: form.primary_color ?? '#6366F1', marginTop: 2 }}>● {form.tagline || 'Tu tagline aquí'}</div>
            </div>
          </div>

          {/* Color principal */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Color principal</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {['#6366F1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#3B82F6','#06B6D4','#F97316','#84CC16','#F0A500','#FF4D6A'].map(c => (
                <button key={c} onClick={() => set('primary_color', c)} style={{
                  width: 30, height: 30, borderRadius: 8, background: c, border: 'none', cursor: 'pointer',
                  outline: form.primary_color === c ? `3px solid ${c}` : '3px solid transparent',
                  outlineOffset: 2, transform: form.primary_color === c ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={form.primary_color ?? '#6366F1'} onChange={e => set('primary_color', e.target.value)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2, background: 'transparent' }} />
              <span style={{ fontSize: 12, color: '#7B7FA8' }}>Color personalizado</span>
            </div>
          </div>

          {/* Banner */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Imagen de portada (Banner)</label>
            <ImageUpload
              bucket="community-media"
              folder={`banners/${selectedCommunityId ?? 'new'}`}
              onUpload={url => set('banner_url', url)}
              currentUrl={form.banner_url}
              label="Subir banner (1200×300px recomendado)"
              maxMB={8}
            />
            <div style={S.hint}>Imagen que aparece en la parte superior de tu comunidad</div>
          </div>

          {/* Logo */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Logo de la comunidad</label>
            <ImageUpload
              bucket="community-assets"
              folder={`logos/${selectedCommunityId ?? 'new'}`}
              onUpload={url => set('logo_url', url)}
              currentUrl={form.logo_url}
              label="Subir logo (200×200px cuadrado)"
              rounded={true}
              maxMB={3}
            />
            <div style={S.hint}>Aparece en el navbar y en las cards de la comunidad</div>
          </div>

          {/* Mensaje de bienvenida */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Mensaje de bienvenida</label>
            <textarea value={(form as any).welcome_message ?? ''} onChange={e => set('welcome_message' as any, e.target.value)}
              placeholder="Ej: ¡Bienvenido/a! Estoy muy feliz de que formes parte de esta comunidad. Aquí vas a encontrar..." rows={4} className="input" />
            <div style={S.hint}>Aparece cuando un nuevo miembro se une — hazlo personal y motivador</div>
          </div>

          {/* Video de presentación */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Video de presentación</label>
            <input value={(form as any).intro_video_url ?? ''} onChange={e => set('intro_video_url' as any, e.target.value)}
              placeholder="YouTube: https://youtu.be/... · Vimeo: https://vimeo.com/..." className="input" />
            <div style={S.hint}>Aparece en la página pública de tu comunidad. Compatible con YouTube y Vimeo.</div>
          </div>

          {/* Redes sociales */}
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>Redes sociales del creador</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'social_instagram', icon: '📸', label: 'Instagram', placeholder: 'https://instagram.com/tucuenta' },
                { key: 'social_tiktok',    icon: '🎵', label: 'TikTok',    placeholder: 'https://tiktok.com/@tucuenta' },
                { key: 'social_youtube',   icon: '▶️', label: 'YouTube',   placeholder: 'https://youtube.com/@tucanal' },
                { key: 'social_twitter',   icon: '🐦', label: 'X / Twitter',placeholder: 'https://x.com/tucuenta' },
                { key: 'social_whatsapp',  icon: '💬', label: 'WhatsApp (link de grupo)', placeholder: 'https://chat.whatsapp.com/...' },
                { key: 'social_website',   icon: '🌐', label: 'Sitio web', placeholder: 'https://tuweb.com' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{s.icon}</span>
                  <input
                    value={(form as any)[s.key] ?? ''}
                    onChange={e => set(s.key as any, e.target.value)}
                    placeholder={s.placeholder}
                    className="input"
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
            <div style={S.hint}>Se muestran en el perfil de tu comunidad para que los miembros te sigan</div>
          </div>
        </div>
      )}

      {/* Save button */}
      <button onClick={save} disabled={saving} className="btn-primary" style={{ marginTop: 8 }}>
        <Save size={16} />
        {saving ? 'Guardando...' : community ? 'Guardar cambios' : '🚀 Crear mi comunidad'}
      </button>

      {/* Danger zone */}
      {community && (
        <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,77,106,0.15)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#FF4D6A', marginBottom: 8 }}>⚠️ Zona de peligro</h3>
          <p style={{ fontSize: 13, color: '#6B6A80', marginBottom: 14, lineHeight: 1.6 }}>
            Eliminar tu comunidad notificará a todos los miembros y dará 30 días antes del cierre definitivo.
          </p>
          <a href="/creator/eliminar-comunidad" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', color: '#FF4D6A', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>
            🗑️ Eliminar comunidad
          </a>
        </div>
      )}
    </div>
  )
}
