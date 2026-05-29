'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, CheckCheck, X, MessageSquare, Heart, UserPlus, Trophy, Zap, Star } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  message?: string
  action_url?: string
  link?: string
  actor_id?: string
  is_read: boolean
  read?: boolean
  created_at: string
}

const TYPE_ICON: Record<string, { icon: any; color: string; bg: string }> = {
  post_like:     { icon: Heart,        color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  post_comment:  { icon: MessageSquare,color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  new_member:    { icon: UserPlus,     color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  badge_awarded: { icon: Star,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  xp_earned:     { icon: Zap,         color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  challenge:     { icon: Trophy,       color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  default:       { icon: Bell,         color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

export function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length

  // Load initial notifications
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ec_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data ?? [])
      setLoading(false)
    }
    load()
  }, [userId])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ec_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function markAllRead() {
    await supabase
      .from('ec_notifications')
      .update({ is_read: true, read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })))
  }

  async function markRead(id: string) {
    await supabase
      .from('ec_notifications')
      .update({ is_read: true, read: true })
      .eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n))
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: open ? 'var(--bg2)' : 'transparent',
          border: `1px solid ${open ? 'var(--border2)' : 'transparent'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
          transition: 'all .15s',
          color: 'var(--muted2)',
        }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16,
            borderRadius: '50%',
            background: '#EF4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 340,
          background: 'var(--bg)',
          border: '1px solid var(--border2)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'fadeUp 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notificaciones</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--purple)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 99,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Marcar todas como leídas" style={{
                  padding: '4px 8px', borderRadius: 7,
                  background: 'transparent', border: 'none',
                  color: 'var(--purple)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <CheckCheck size={13} /> Todas leídas
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'var(--bg1)', border: '1px solid var(--border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)',
              }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <Bell size={28} color="var(--border2)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Sin notificaciones aún</p>
              </div>
            ) : (
              notifications.map(n => {
                const isRead = n.is_read || n.read
                const typeStyle = TYPE_ICON[n.type] ?? TYPE_ICON.default
                const IconComponent = typeStyle.icon
                const url = n.action_url || n.link
                const text = n.body || n.message || ''

                const content = (
                  <div
                    onClick={() => !isRead && markRead(n.id)}
                    style={{
                      display: 'flex', gap: 11, padding: '11px 16px',
                      background: isRead ? 'transparent' : 'rgba(108,71,255,0.04)',
                      borderBottom: '1px solid var(--border)',
                      cursor: url ? 'pointer' : 'default',
                      transition: 'background .1s',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: typeStyle.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComponent size={15} color={typeStyle.color} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: isRead ? 400 : 600,
                        color: 'var(--text)', lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {n.title}
                      </div>
                      {text && (
                        <div style={{
                          fontSize: 12, color: 'var(--muted)',
                          marginTop: 2, lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {text}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        {timeAgo(n.created_at)}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!isRead && (
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--purple)', flexShrink: 0, marginTop: 4,
                      }} />
                    )}
                  </div>
                )

                return url ? (
                  <Link key={n.id} href={url} style={{ textDecoration: 'none' }} onClick={() => { markRead(n.id); setOpen(false) }}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link href="/notificaciones" onClick={() => setOpen(false)}
              style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>
              Ver todas las notificaciones →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
