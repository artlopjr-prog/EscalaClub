'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, Settings, Lock, Unlock, Trash2 } from 'lucide-react'

const C = { bg: 'var(--bg)', bg1: 'var(--bg1)', bg2: 'var(--bg1)', border: 'var(--border)', text: 'var(--text)', muted: 'var(--muted)', muted2: 'var(--muted2)', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', red: '#FF4D6A' }

interface Message { id: string; content: string; author_id: string; created_at: string; author?: any }

interface Props {
  community: { id: string; name: string; slug: string; primary_color?: string; owner_id: string; chat_mode?: string }
  messages: Message[]
  userId: string
  userProfile: { display_name: string; avatar_url: string | null }
  isOwner: boolean
  userRole: string
}

export default function ChatClient({ community, messages: initialMessages, userId, userProfile, isOwner, userRole }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState(initialMessages)
  const [text, setText] = useState('')
  const [chatMode, setChatMode] = useState(community.chat_mode ?? 'open')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const accent = community.primary_color ?? '#7C3AED'

  const canWrite = isOwner || userRole === 'admin' || userRole === 'moderator' || chatMode === 'open'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${community.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ec_chat_messages',
        filter: `community_id=eq.${community.id}`
      }, async (payload) => {
        const { data: msg } = await supabase
          .from('ec_chat_messages')
          .select('*, author:ec_profiles(id, display_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (msg) setMessages(prev => [...prev, msg as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [community.id])

  async function sendMessage() {
    if (!text.trim() || !canWrite) return
    setSending(true)
    const { error } = await supabase.from('ec_chat_messages').insert({
      community_id: community.id,
      author_id: userId,
      content: text.trim(),
    })
    if (error) toast.error('Error al enviar')
    setText('')
    setSending(false)
  }

  async function deleteMessage(msgId: string) {
    await supabase.from('ec_chat_messages').delete().eq('id', msgId)
    setMessages(prev => prev.filter(m => m.id !== msgId))
  }

  async function toggleChatMode() {
    const newMode = chatMode === 'open' ? 'announcement' : 'open'
    await supabase.from('ec_communities').update({ chat_mode: newMode }).eq('id', community.id)
    setChatMode(newMode)
    toast.success(newMode === 'open' ? 'Chat abierto — todos pueden escribir' : 'Solo tú puedes escribir ahora')
  }

  function timeLabel(d: string) {
    const date = new Date(d)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    return isToday
      ? date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Link href={`/comunidades/${community.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, textDecoration: 'none', fontSize: 12, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}` }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, color: C.text }}>💭 Chat — {community.name}</div>
          <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
            {chatMode === 'open' ? <><Unlock size={10} /> Chat abierto</> : <><Lock size={10} /> Solo el creador escribe</>}
          </div>
        </div>
        {isOwner && (
          <button onClick={toggleChatMode} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: chatMode === 'open' ? 'rgba(255,77,106,0.1)' : 'rgba(0,214,143,0.1)', border: `1px solid ${chatMode === 'open' ? C.red + '40' : C.green + '40'}`, color: chatMode === 'open' ? C.red : C.green, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
            {chatMode === 'open' ? <><Lock size={12} /> Modo anuncio</> : <><Unlock size={12} /> Abrir chat</>}
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💭</div>
            <p style={{ fontSize: 14 }}>No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.author_id === userId
          const isOwnerMsg = msg.author_id === community.owner_id
          const showAvatar = i === 0 || messages[i-1].author_id !== msg.author_id
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', marginTop: showAvatar ? 12 : 2 }}>
              {!isMe && showAvatar && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accent, flexShrink: 0, overflow: 'hidden' }}>
                  {msg.author?.avatar_url ? <img src={msg.author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (msg.author?.display_name?.[0]?.toUpperCase() ?? '?')}
                </div>
              )}
              {!isMe && !showAvatar && <div style={{ width: 30 }} />}
              <div style={{ maxWidth: '70%' }}>
                {showAvatar && !isMe && (
                  <div style={{ fontSize: 11, color: isOwnerMsg ? accent : C.muted, fontWeight: 700, marginBottom: 3, marginLeft: 4 }}>
                    {msg.author?.display_name ?? 'Usuario'} {isOwnerMsg && '👑'}
                  </div>
                )}
                <div style={{ position: 'relative' }}
                  onMouseEnter={e => { if (isMe || isOwner) (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('display', 'flex') }}
                  onMouseLeave={e => { (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('display', 'none') }}>
                  <div style={{ background: isMe ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : C.bg2, borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: 14, color: isMe ? '#fff' : C.text, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3, textAlign: isMe ? 'right' : 'left', marginLeft: 4, marginRight: 4 }}>{timeLabel(msg.created_at)}</div>
                  {(isMe || isOwner) && (
                    <button className="del-btn" onClick={() => deleteMessage(msg.id)} style={{ display: 'none', position: 'absolute', top: 4, right: isMe ? 'auto' : 4, left: isMe ? 4 : 'auto', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', color: C.red, padding: '4px 6px', borderRadius: 6, alignItems: 'center' }}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: C.bg1, borderTop: `1px solid ${C.border}`, padding: '12px 18px', flexShrink: 0 }}>
        {canWrite ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 16px', color: C.text, fontSize: 14, outline: 'none' }}
            />
            <button onClick={sendMessage} disabled={!text.trim() || sending} style={{ width: 44, height: 44, borderRadius: 12, background: text.trim() ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : 'var(--border)', color: text.trim() ? '#fff' : C.muted, border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px', fontSize: 13, color: C.muted, background: C.bg2, borderRadius: 12 }}>
            <Lock size={13} style={{ display: 'inline', marginRight: 6 }} />
            El creador ha limitado el chat — solo el administrador puede escribir
          </div>
        )}
      </div>
    </div>
  )
}
