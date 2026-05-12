'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Check, Megaphone, MessageCircle, Calendar, Users, Trash2 } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500' }

const ICONS: Record<string, any> = {
  announcement: { icon: Megaphone, color: '#F0A500', bg: 'rgba(240,165,0,0.1)' },
  comment: { icon: MessageCircle, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  event: { icon: Calendar, color: '#00D68F', bg: 'rgba(0,214,143,0.1)' },
  new_member: { icon: Users, color: '#9F67FF', bg: 'rgba(124,58,237,0.1)' },
  default: { icon: Bell, color: '#6B6A80', bg: 'rgba(107,106,128,0.1)' },
}

export default function NotificacionesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('ec_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifs(data ?? [])
      setLoading(false)
      // Mark all as read
      await supabase.from('ec_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    }
    load()
  }, [])

  async function deleteNotif(id: string) {
    await supabase.from('ec_notifications').delete().eq('id', id)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('ec_notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'ahora'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Cargando...</div>

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div style={{ padding: 28, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: C.text, marginBottom: 4 }}>
            Notificaciones 🔔 {unread > 0 && <span style={{ fontSize: 16, padding: '2px 10px', borderRadius: 99, background: '#7C3AED', color: '#fff', marginLeft: 8 }}>{unread}</span>}
          </h1>
          <p style={{ fontSize: 13, color: C.muted }}>{notifs.length} notificaciones</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: C.purple2, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <Check size={13} /> Marcar todas como leídas
          </button>
        )}
      </div>

      {notifs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map(n => {
            const iconInfo = ICONS[n.type] ?? ICONS.default
            const Icon = iconInfo.icon
            return (
              <div key={n.id} style={{ background: n.is_read ? C.bg1 : 'rgba(124,58,237,0.06)', border: `1px solid ${n.is_read ? C.border : 'rgba(124,58,237,0.15)'}`, borderRadius: 16, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: iconInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={iconInfo.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 700, color: C.text, marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{timeAgo(n.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {n.action_url && (
                    <Link href={n.action_url} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', color: C.purple2, textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>
                      Ver →
                    </Link>
                  )}
                  <button onClick={() => deleteNotif(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8, display: 'flex' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 8 }}>Todo al día</h3>
          <p style={{ fontSize: 14, color: C.muted }}>No tienes notificaciones nuevas</p>
        </div>
      )}
    </div>
  )
}
