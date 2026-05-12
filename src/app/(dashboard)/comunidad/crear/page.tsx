'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Globe, DollarSign, Tag, Image, Check } from 'lucide-react'

const categories = ['negocios', 'marketing', 'ventas', 'ia', 'liderazgo', 'finanzas', 'tecnologia', 'otro']
const accentColors = ['#7C3AED', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4']

export default function CrearComunidadPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'negocios',
    language: 'es' as 'es' | 'pt' | 'both',
    is_free: true,
    price_monthly: '',
    price_annual: '',
    accent_color: '#7C3AED',
    cover_url: '',
    logo_url: '',
  })

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  function handleNameChange(name: string) {
    update('name', name)
    if (!form.slug || form.slug === slugify(form.name)) {
      update('slug', slugify(name))
    }
  }

  async function handleSubmit() {
    if (!form.name || !form.slug || !form.description) { toast.error('Completa los campos requeridos'); return }
    if (!form.is_free && !form.price_monthly) { toast.error('Define el precio mensual'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('No autenticado'); setLoading(false); return }

    const { data, error } = await supabase.from('ec_communities').insert({
      owner_id: user.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      category: form.category,
      language: form.language,
      is_free: form.is_free,
      price_monthly: form.is_free ? 0 : Number(form.price_monthly),
      price_annual: form.price_annual ? Number(form.price_annual) : null,
      accent_color: form.accent_color,
      cover_url: form.cover_url || null,
      logo_url: form.logo_url || null,
      status: 'active',
    }).select().single()

    if (error) {
      if (error.code === '23505') toast.error('Ese slug ya está en uso. Elige otro.')
      else toast.error('Error al crear: ' + error.message)
      setLoading(false)
      return
    }

    // Auto-join as admin
    await supabase.from('ec_community_members').insert({
      community_id: data.id, member_id: user.id, role: 'admin', status: 'active'
    })

    toast.success('¡Comunidad creada exitosamente! 🎉')
    router.push(`/comunidades/${form.slug}`)
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/comunidades" className="text-ec-muted hover:text-ec-text transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Crear Comunidad</h1>
          <p className="text-sm text-ec-muted">Paso {step} de 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-ec-primary shadow-glow-sm' : 'bg-ec-surface-3'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="p-6 animate-fadeIn">
          <h2 className="font-display text-xl font-bold mb-6">Información básica</h2>
          <div className="space-y-5">
            <Input
              label="Nombre de la comunidad *"
              placeholder="Ej: Emprendedores Colombia"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              icon={<Globe size={16} />}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ec-text/80 font-display">URL de la comunidad *</label>
              <div className="flex items-center gap-2 bg-ec-surface-2 border border-ec-border rounded-xl px-4 py-3">
                <span className="text-ec-muted text-sm">escalaclub.com/c/</span>
                <input
                  value={form.slug}
                  onChange={e => update('slug', slugify(e.target.value))}
                  className="flex-1 bg-transparent text-ec-text text-sm focus:outline-none"
                  placeholder="mi-comunidad"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ec-text/80 font-display">Descripción *</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={4}
                placeholder="Describe tu comunidad. ¿Quién es el miembro ideal? ¿Qué valor recibirán?"
                className="w-full bg-ec-surface-2 border border-ec-border rounded-xl px-4 py-3 text-ec-text placeholder:text-ec-muted focus:outline-none focus:border-ec-primary/60 transition-all resize-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ec-text/80 font-display flex items-center gap-1.5"><Tag size={14} />Categoría</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => update('category', cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all font-display ${form.category === cat ? 'bg-ec-primary text-white shadow-glow-sm' : 'bg-ec-surface-2 border border-ec-border text-ec-muted hover:text-ec-text'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ec-text/80 font-display">Idioma principal</label>
              <div className="flex gap-2">
                {[['es', '🇪🇸 Español'], ['pt', '🇧🇷 Português'], ['both', '🌐 Ambos']].map(([val, label]) => (
                  <button key={val} onClick={() => update('language', val)}
                    className={`flex-1 py-2 rounded-xl text-sm font-display font-600 transition-all ${form.language === val ? 'bg-ec-primary text-white' : 'bg-ec-surface-2 text-ec-muted border border-ec-border'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full mt-2" disabled={!form.name || !form.slug || !form.description}>
              Siguiente →
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 animate-fadeIn">
          <h2 className="font-display text-xl font-bold mb-6">Precio y monetización</h2>
          <div className="space-y-5">
            {/* Free vs paid */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => update('is_free', true)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${form.is_free ? 'border-ec-success bg-ec-success/10' : 'border-ec-border bg-ec-surface-2'}`}>
                <div className="text-2xl mb-2">🎁</div>
                <div className="font-display font-bold text-sm">Gratis</div>
                <div className="text-xs text-ec-muted mt-1">Acceso libre para todos</div>
              </button>
              <button onClick={() => update('is_free', false)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${!form.is_free ? 'border-ec-primary bg-ec-primary/10' : 'border-ec-border bg-ec-surface-2'}`}>
                <div className="text-2xl mb-2">💰</div>
                <div className="font-display font-bold text-sm">De pago</div>
                <div className="text-xs text-ec-muted mt-1">Membresía mensual/anual</div>
              </button>
            </div>

            {!form.is_free && (
              <div className="space-y-4 animate-fadeIn">
                <Input
                  label="Precio mensual (USD) *"
                  type="number"
                  placeholder="Ej: 29"
                  value={form.price_monthly}
                  onChange={e => update('price_monthly', e.target.value)}
                  icon={<DollarSign size={16} />}
                  hint="Recomendado: $29 - $197 dependiendo del valor ofrecido"
                />
                <Input
                  label="Precio anual (USD) — opcional"
                  type="number"
                  placeholder="Ej: 279 (ahorro de 2 meses)"
                  value={form.price_annual}
                  onChange={e => update('price_annual', e.target.value)}
                  icon={<DollarSign size={16} />}
                  hint="Tip: Ofrece ~2 meses gratis para incentivar el pago anual"
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">← Atrás</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Siguiente →</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 animate-fadeIn">
          <h2 className="font-display text-xl font-bold mb-6">Diseño y apariencia</h2>
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ec-text/80 font-display">Color principal</label>
              <div className="flex gap-3">
                {accentColors.map(color => (
                  <button key={color} onClick={() => update('accent_color', color)}
                    className={`w-10 h-10 rounded-xl transition-all flex-shrink-0 ${form.accent_color === color ? 'ring-2 ring-offset-2 ring-offset-ec-surface ring-white scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}>
                    {form.accent_color === color && <Check size={16} className="text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="URL de portada (cover)"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={form.cover_url}
              onChange={e => update('cover_url', e.target.value)}
              icon={<Image size={16} />}
              hint="Imagen horizontal 1200x400px"
            />
            <Input
              label="URL del logo"
              placeholder="https://ejemplo.com/logo.png"
              value={form.logo_url}
              onChange={e => update('logo_url', e.target.value)}
              icon={<Image size={16} />}
              hint="Imagen cuadrada, mínimo 200x200px"
            />

            {/* Preview */}
            <div className="rounded-xl overflow-hidden border border-ec-border">
              <div className="h-20 flex items-center justify-center text-sm text-ec-muted"
                style={{ background: form.cover_url ? undefined : `linear-gradient(135deg, ${form.accent_color}44, ${form.accent_color}11)` }}>
                {form.cover_url ? <img src={form.cover_url} alt="" className="w-full h-full object-cover" /> : '📸 Preview portada'}
              </div>
              <div className="px-4 pb-4 -mt-3">
                <div className="w-10 h-10 rounded-xl border-2 border-ec-bg flex items-center justify-center text-xl"
                  style={{ background: form.accent_color + '33' }}>
                  {form.logo_url ? <img src={form.logo_url} alt="" className="w-full h-full rounded-xl object-cover" /> : '🌐'}
                </div>
                <div className="mt-2 font-display font-bold text-sm">{form.name || 'Nombre de tu comunidad'}</div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="neutral" size="sm">{form.category}</Badge>
                  {form.is_free ? <Badge variant="success" size="sm">Gratis</Badge> : <Badge variant="primary" size="sm">${form.price_monthly || '??'}/mes</Badge>}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">← Atrás</Button>
              <Button onClick={handleSubmit} loading={loading} className="flex-1">
                🚀 Crear comunidad
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
