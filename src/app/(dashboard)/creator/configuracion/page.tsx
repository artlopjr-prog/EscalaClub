'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Save, MessageSquare, ImageIcon, Video, HelpCircle } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', red: '#FF4D6A', gold: '#F0A500' }

function Toggle({ value, onChange, label, description, icon: Icon, color = '#9F67FF' }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: value ? color + '18' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
        <Icon size={17} color={value ? color : C.muted} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{description}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: value ? color : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'all 0.2s', flexShrink: 0,
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: value ? 25 : 3, transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}

export default function ConfiguracionPage() {
  const supabase = createClient()
  const router = useRouter()
  const [community, setCommunity] = useState<any>(null)
  const [config, setConfig] = useState({ members_can_post: true, members_can_upload_images: true, members_can_upload_videos: false, chat_mode: 'open', qa_enabled: true })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: comm } = await supabase.from('ec_communities').select('*').eq('owner_id', user.id).maybeSingle()
      if (!comm) { router.push('/creator'); return }
      setCommunity(comm)
      setConfig({ members_can_post: comm.members_can_post ?? true, members_can_upload_images: comm.members_can_upload_images ?? true, members_can_upload_videos: comm.members_can_upload_videos ?? false, chat_mode: comm.chat_mode ?? 'open', qa_enabled: comm.qa_enabled ?? true })
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('ec_communities').update(config).eq('id', community.id)
    if (error) toast.error('Error al guardar')
    else toast.success('¡Configuración guardada! ✅')
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  return (
    <div style={{ padding: 28, maxWidth: 660, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/creator" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 12 }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em', color: C.text, marginBottom: 2 }}>⚙️ Permisos</h1>
          <p style={{ fontSize: 12, color: C.muted }}>Controla qué pueden hacer tus miembros</p>
        </div>
      </div>

      {/* Foro permisos */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 20px 0', marginBottom: 14 }}>
        <div style={{ padding: '14px 0 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>💬 Foro</div>
        </div>
        <Toggle value={config.members_can_post} onChange={(v: boolean) => setConfig(c => ({ ...c, members_can_post: v }))} label="Miembros pueden crear posts" description="Si está desactivado, solo tú publicas. Miembros solo comentan." icon={MessageSquare} color="#9F67FF" />
        <Toggle value={config.members_can_upload_images} onChange={(v: boolean) => setConfig(c => ({ ...c, members_can_upload_images: v }))} label="Miembros pueden subir imágenes" description="Permite imágenes en posts del foro." icon={ImageIcon} color="#3B82F6" />
        <Toggle value={config.members_can_upload_videos} onChange={(v: boolean) => setConfig(c => ({ ...c, members_can_upload_videos: v }))} label="Miembros pueden subir videos" description="Permite videos en posts del foro." icon={Video} color="#EC4899" />
        <div style={{ padding: '4px 0' }} />
      </div>

      {/* Chat */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 14 }}>💭 Chat</div>
        {[
          { value: 'open', label: 'Chat abierto', desc: 'Todos los miembros pueden escribir', icon: '💬' },
          { value: 'announcement', label: 'Solo el creador escribe', desc: 'Los miembros solo leen', icon: '📢' },
          { value: 'disabled', label: 'Chat desactivado', desc: 'Sin chat en esta comunidad', icon: '🔇' },
        ].map(opt => (
          <button key={opt.value} onClick={() => setConfig(c => ({ ...c, chat_mode: opt.value }))} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, width: '100%',
            background: config.chat_mode === opt.value ? 'rgba(124,58,237,0.1)' : C.bg2,
            border: `2px solid ${config.chat_mode === opt.value ? C.purple : C.border}`,
            cursor: 'pointer', textAlign: 'left', marginBottom: 8, transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 20 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: config.chat_mode === opt.value ? C.purple2 : C.text }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{opt.desc}</div>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${config.chat_mode === opt.value ? C.purple : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {config.chat_mode === opt.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.purple }} />}
            </div>
          </button>
        ))}
      </div>

      {/* Q&A */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 20px 0', marginBottom: 24 }}>
        <div style={{ padding: '14px 0 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 14, color: C.text }}>❓ Q&A</div>
        </div>
        <Toggle value={config.qa_enabled} onChange={(v: boolean) => setConfig(c => ({ ...c, qa_enabled: v }))} label="Habilitar preguntas y respuestas" description="Los miembros pueden enviar preguntas que tú respondes públicamente." icon={HelpCircle} color={C.gold} />
        <div style={{ padding: '4px 0' }} />
      </div>

      <button onClick={save} disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  )
}
