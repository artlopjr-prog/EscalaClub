'use client'

import { useState } from 'react'
import { MessageSquare, Check, X, Bell, Phone, Shield, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const WA_GREEN = '#25D366'
const WA_DARK  = '#128C7E'

type Prefs = {
  whatsapp_enabled: boolean
  whatsapp_phone: string | null
  whatsapp_verified: boolean
  wa_new_post: boolean
  wa_new_event: boolean
  wa_challenge_reminder: boolean
  wa_challenge_complete: boolean
  wa_new_badge: boolean
  wa_daily_spin: boolean
  wa_new_member: boolean
  email_enabled: boolean
  email_digest: string
}

const NOTIF_TYPES = [
  { key: 'wa_challenge_reminder', label: 'Recordatorio de reto diario',   emoji: '⚡', desc: 'Te recuerda marcar tu check cuando no lo has hecho' },
  { key: 'wa_challenge_complete', label: 'Reto completado',                emoji: '🏆', desc: 'Cuando completas un reto y desbloqueas recompensas' },
  { key: 'wa_new_post',           label: 'Nuevos posts en comunidades',    emoji: '💬', desc: 'Posts importantes en tus comunidades favoritas' },
  { key: 'wa_new_event',         label: 'Próximos eventos',               emoji: '📅', desc: 'Eventos en tus comunidades con 1 hora de anticipación' },
  { key: 'wa_new_badge',         label: 'Nuevo badge desbloqueado',       emoji: '🎖', desc: 'Cuando obtienes un nuevo badge en la plataforma' },
  { key: 'wa_daily_spin',        label: 'Recordatorio del Spin diario',   emoji: '🎡', desc: 'Te avisa cuando tu spin diario está disponible' },
  { key: 'wa_new_member',        label: 'Nuevos miembros',                emoji: '👋', desc: 'Cuando alguien nuevo se une a tu comunidad' },
]

interface Props {
  userId: string
  prefs: Prefs | null
  profile: any
  recentLogs: any[]
}

export default function NotificacionesClient({ userId, prefs, profile, recentLogs }: Props) {
  const [phone, setPhone] = useState(prefs?.whatsapp_phone ?? '')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'idle' | 'sent' | 'verified'>(
    prefs?.whatsapp_verified ? 'verified' : 'idle'
  )
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Prefs>({
    whatsapp_enabled: prefs?.whatsapp_enabled ?? false,
    whatsapp_phone: prefs?.whatsapp_phone ?? null,
    whatsapp_verified: prefs?.whatsapp_verified ?? false,
    wa_new_post: prefs?.wa_new_post ?? true,
    wa_new_event: prefs?.wa_new_event ?? true,
    wa_challenge_reminder: prefs?.wa_challenge_reminder ?? true,
    wa_challenge_complete: prefs?.wa_challenge_complete ?? true,
    wa_new_badge: prefs?.wa_new_badge ?? true,
    wa_daily_spin: prefs?.wa_daily_spin ?? false,
    wa_new_member: prefs?.wa_new_member ?? false,
    email_enabled: prefs?.email_enabled ?? true,
    email_digest: prefs?.email_digest ?? 'daily',
  })

  async function sendCode() {
    if (!phone.trim()) { toast.error('Ingresa tu número de WhatsApp'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al enviar código'); return }
      setStep('sent')
      toast.success('Código enviado por WhatsApp ✓')
    } catch { toast.error('Error de conexión') }
    finally { setLoading(false) }
  }

  async function verifyCode() {
    if (!code.trim()) { toast.error('Ingresa el código de 6 dígitos'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Código incorrecto'); return }
      setStep('verified')
      setSettings(s => ({ ...s, whatsapp_verified: true, whatsapp_enabled: true }))
      toast.success('¡WhatsApp conectado exitosamente! 🎉')
    } catch { toast.error('Error de conexión') }
    finally { setLoading(false) }
  }

  async function savePrefs(key: string, value: boolean) {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    try {
      await fetch('/api/whatsapp/prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
    } catch { /* silent fail, UI ya actualizó */ }
  }

  async function disconnect() {
    setLoading(true)
    try {
      await fetch('/api/whatsapp/verify', { method: 'DELETE' })
      setStep('idle')
      setSettings(s => ({ ...s, whatsapp_verified: false, whatsapp_enabled: false }))
      setPhone('')
      toast.success('WhatsApp desconectado')
    } catch { toast.error('Error al desconectar') }
    finally { setLoading(false) }
  }

  const isConnected = step === 'verified'

  return (
    <div style={{ padding: '32px 28px', maxWidth: 720, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>EscalaClub</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(26px,5vw,38px)', letterSpacing: '-0.04em', marginBottom: 6 }}>
          🔔 Notificaciones
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)' }}>Conecta WhatsApp para recibir alertas donde ya estás</p>
      </div>

      {/* WHATSAPP CONNECTION CARD */}
      <div style={{
        background: isConnected
          ? `linear-gradient(135deg, rgba(37,211,102,0.1), rgba(37,211,102,0.04))`
          : 'var(--bg1)',
        border: `1px solid ${isConnected ? 'rgba(37,211,102,0.3)' : 'var(--border)'}`,
        borderRadius: 20, padding: '24px', marginBottom: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${WA_GREEN}22`, border: `1px solid ${WA_GREEN}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            <MessageSquare size={24} color={WA_GREEN} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 3 }}>WhatsApp</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)' }}>
              {isConnected
                ? `Conectado · ${settings.whatsapp_phone ?? phone}`
                : 'Recibe notificaciones directamente en WhatsApp'}
            </div>
          </div>
          {isConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 99, padding: '4px 12px' }}>
              <Check size={12} color={WA_GREEN} />
              <span style={{ fontSize: 11, fontWeight: 700, color: WA_GREEN }}>Activo</span>
            </div>
          )}
        </div>

        {/* STEP: idle — ingresar teléfono */}
        {!isConnected && step === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                Tu número de WhatsApp
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+507 6123 4567"
                  style={{ flex: 1 }}
                  onKeyDown={e => e.key === 'Enter' && sendCode()}
                />
                <button onClick={sendCode} disabled={loading}
                  style={{ padding: '11px 18px', borderRadius: 10, background: WA_GREEN, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: loading ? 'default' : 'pointer', opacity: loading ? .7 : 1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                Incluye el código de tu país. Ej: +507 (Panamá), +52 (México), +57 (Colombia)
              </p>
            </div>

            {/* Por qué conectar */}
            <div style={{ background: 'var(--bg1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Por qué conectar WhatsApp</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Recordatorios de retos antes de que pierdas tu racha', 'Notificaciones de eventos en tus comunidades', 'Alertas de nuevos badges desbloqueados', 'Todo donde ya estás — sin abrir otra app'].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Check size={13} color={WA_GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP: sent — ingresar código */}
        {!isConnected && step === 'sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <MessageSquare size={16} color={WA_GREEN} />
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                Código enviado a <strong style={{ color: 'var(--text)' }}>{phone}</strong> — revisa tu WhatsApp
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>Código de verificación</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456" maxLength={6} style={{ flex: 1, fontSize: 20, letterSpacing: '0.2em', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                  onKeyDown={e => e.key === 'Enter' && verifyCode()} />
                <button onClick={verifyCode} disabled={loading || code.length !== 6}
                  style={{ padding: '11px 18px', borderRadius: 10, background: code.length === 6 ? WA_GREEN : 'var(--bg3)', border: 'none', color: code.length === 6 ? '#fff' : 'var(--muted)', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: code.length === 6 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  {loading ? <Loader2 size={14} /> : <Shield size={14} />}
                  Verificar
                </button>
              </div>
            </div>
            <button onClick={() => setStep('idle')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
              ← Cambiar número
            </button>
          </div>
        )}

        {/* STEP: verified — activo */}
        {isConnected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'rgba(37,211,102,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Número conectado</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{settings.whatsapp_phone ?? phone}</div>
              </div>
              <div style={{ background: 'rgba(37,211,102,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Estado</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: WA_GREEN }}>✓ Verificado y activo</div>
              </div>
            </div>
            <button onClick={disconnect} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 8, padding: '7px 14px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Desconectar WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* NOTIFICATION PREFERENCES */}
      {isConnected && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
            Qué recibir en WhatsApp
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 18 }}>
            Activa solo lo que te sea útil — sin spam
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NOTIF_TYPES.map(n => {
              const enabled = (settings as any)[n.key]
              return (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, transition: 'background .12s', cursor: 'pointer' }}
                  onClick={() => savePrefs(n.key, !enabled)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg1)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{n.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{n.desc}</div>
                  </div>
                  {/* Toggle */}
                  <div onClick={e => { e.stopPropagation(); savePrefs(n.key, !enabled) }}
                    style={{ width: 44, height: 24, borderRadius: 99, background: enabled ? WA_GREEN : 'var(--bg3)', border: `1px solid ${enabled ? WA_GREEN : 'var(--border2)'}`, position: 'relative', cursor: 'pointer', transition: 'all .2s', flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: enabled ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 4px var(--border2)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* RECENT NOTIFICATIONS LOG */}
      {recentLogs.length > 0 && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>
            Historial reciente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentLogs.map((log, i) => {
              const typeLabels: Record<string, string> = {
                new_post: '💬 Nuevo post',
                challenge_reminder: '⚡ Recordatorio de reto',
                challenge_complete: '🏆 Reto completado',
                new_event: '📅 Nuevo evento',
                new_badge: '🎖 Badge obtenido',
                daily_spin: '🎡 Spin diario',
              }
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 16 }}>{log.channel === 'whatsapp' ? '📱' : '📧'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{typeLabels[log.type] ?? log.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      {new Date(log.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: log.status === 'sent' ? 'rgba(0,207,136,0.12)' : 'rgba(255,77,106,0.12)', color: log.status === 'sent' ? 'var(--green)' : 'var(--red)' }}>
                    {log.status === 'sent' ? '✓ Enviado' : '✗ Error'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* COMING SOON — Email digest */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', marginTop: 20, opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Bell size={18} color="var(--muted)" />
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15 }}>Email digest</div>
          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--bg3)', color: 'var(--muted)', borderRadius: 99, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Próximamente</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Resumen diario o semanal de toda tu actividad por email</p>
      </div>

    </div>
  )
}
