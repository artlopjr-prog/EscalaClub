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
  title: { fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: '#EEEDF5', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B6A80' },
  tabs: { display: 'flex', gap: 4, padding: 4, background: '#0D0D14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, width: 'fit-content', marginBottom: 24 },
  tab: (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 9, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700,
    background: active ? 'linear-gradient(135deg, #7C3AED, #9F67FF)' : 'transparent',
    color: active ? '#fff' : '#6B6A80', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
  }),
  card: { background: '#0D0D14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px', marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B6A80', marginBottom: 8, fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  required: { color: '#FF4D6A', marginLeft: 2 },
  hint: { fontSize: 11, color: '#6B6A80', marginTop: 5, lineHeight: 1.5 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' },
}

export default function CreatorComunidadPage() {
  const supabase = createClient()
  const [community, setCommunity] = useState<Community | null>(null)
  const [form, setForm] = useState<Partial<Community>>({
    name: '', slug: '', description: '', tagline: '', category: 'negocios',
    locale: 'es', access_type: 'public', price_monthly: 0, price_yearly: 0, paypal_account_email: '',
    primary_color: '#7C3AED', logo_url: '', banner_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info'|'pricing'|'appearance'>('info')
  const [userId, setUserId] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
    if (data) { setCommunity(data); setForm(data) }
    setLoading(false)
  }, [supabase])

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

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ ...S.header, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={S.title}>{community ? 'Mi comunidad' : 'Crear mi comunidad'}</h1>
          {community && (
            <p style={S.subtitle}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00D68F', marginRight: 6 }} />
              {community.member_count ?? 0} miembros · escalaclub.com/comunidades/{community.slug}
            </p>
          )}
        </div>
        {community && (
          <Link href={`/comunidades/${community.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', fontSize: 12, color: '#9998B0' }}>
            <Eye size={13} /> Ver pública
          </Link>
        )}
      </div>

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
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#EEEDF5', marginBottom: 4 }}>{opt.label}</div>
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
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#9F67FF' }}>${form.price_monthly}/mes</span>
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
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#00D68F', marginBottom: 4 }}>✓ Comunidad gratuita</div>
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
          <div style={{ marginBottom: 24 }}>
            <label style={S.label}>Color de acento</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => set('primary_color', c)} style={{
                  width: 36, height: 36, borderRadius: 10, background: c, border: 'none', cursor: 'pointer',
                  outline: form.primary_color === c ? `3px solid ${c}` : '3px solid transparent',
                  outlineOffset: 2, transform: form.primary_color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#13131C', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (form.primary_color ?? '#7C3AED') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌐</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#EEEDF5', marginBottom: 2 }}>{form.name || 'Tu comunidad'}</div>
                <div style={{ fontSize: 11, color: form.primary_color ?? '#7C3AED' }}>Así se verá el color en tu perfil</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>URL del banner (imagen de portada)</label>
            <input value={form.banner_url ?? ''} onChange={e => set('banner_url', e.target.value)}
              placeholder="https://... (imagen 1200×400px recomendada)" className="input" />
            {form.banner_url && (
              <div style={{ marginTop: 10, height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
                <img src={form.banner_url} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>URL del logo</label>
            <input value={form.logo_url ?? ''} onChange={e => set('logo_url', e.target.value)}
              placeholder="https://... (imagen cuadrada 200×200px)" className="input" />
            {form.logo_url && (
              <div style={{ marginTop: 10, width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
                <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={S.hint}>💡 Usa Cloudinary, Imgur o cualquier hosting de imágenes para obtener la URL</div>
          </div>
        </div>
      )}

      {/* Save button */}
      <button onClick={save} disabled={saving} className="btn-primary" style={{ marginTop: 8 }}>
        <Save size={16} />
        {saving ? 'Guardando...' : community ? 'Guardar cambios' : '🚀 Crear mi comunidad'}
      </button>
    </div>
  )
}
