'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Bot, Sparkles, Plus, ChevronRight, Settings, Trash2, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

type Message = { role: 'user' | 'assistant'; content: string; id: string }
type Conversation = { id: string; title: string; message_count: number; created_at: string }

interface Props {
  userId: string
  community: { id: string; name: string; description: string; category: string; logo_url?: string; primary_color?: string; owner_id: string }
  config: any
  conversations: Conversation[]
  isOwner: boolean
  userProfile: { name: string; avatar?: string }
}

const SUGGESTED = [
  '¿De qué temas habla esta comunidad?',
  '¿Cómo puedo sacar el máximo provecho?',
  '¿Cuáles son los recursos más importantes?',
  'Explícame el concepto más importante',
]

export default function AITutorClient({ userId, community, config, conversations: initialConvs, isOwner, userProfile }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>(initialConvs)
  const [showSidebar, setShowSidebar] = useState(true)
  const [configMode, setConfigMode] = useState(false)
  const [configForm, setConfigForm] = useState({
    tutor_name: config?.tutor_name ?? 'Asistente IA',
    tutor_persona: config?.tutor_persona ?? '',
    context_docs: config?.context_docs ?? '',
    enabled: config?.enabled ?? true,
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const accent = community.primary_color ?? '#7B5EF8'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function startNewConversation() {
    const { data, error } = await supabase.from('ec_ai_conversations').insert({
      community_id: community.id,
      user_id: userId,
      title: 'Nueva conversación',
    }).select().single()
    if (error || !data) { toast.error('Error al crear conversación'); return null }
    setConvId(data.id)
    setMessages([])
    setConversations(prev => [data, ...prev])
    return data.id
  }

  async function loadConversation(id: string) {
    const { data } = await supabase
      .from('ec_ai_messages')
      .select('id, role, content')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    setConvId(id)
    setMessages((data ?? []).map(m => ({ ...m, role: m.role as 'user' | 'assistant' })))
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    let activeConvId = convId
    if (!activeConvId) {
      activeConvId = await startNewConversation()
      if (!activeConvId) return
    }

    const userMsg: Message = { role: 'user', content, id: Date.now().toString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          communityId: community.id,
          conversationId: activeConvId,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Error')

      const aiMsg: Message = { role: 'assistant', content: data.message, id: (Date.now() + 1).toString() }
      setMessages(prev => [...prev, aiMsg])

      // Update conversation title after first message
      if (newMessages.length === 1) {
        const newTitle = content.slice(0, 55)
        setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, title: newTitle } : c))
      }
    } catch {
      toast.error('Error al conectar con el tutor IA')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function saveConfig() {
    const existing = config?.id
    if (existing) {
      await supabase.from('ec_ai_tutor_config').update(configForm).eq('id', existing)
    } else {
      await supabase.from('ec_ai_tutor_config').insert({ ...configForm, community_id: community.id })
    }
    toast.success('Configuración guardada ✓')
    setConfigMode(false)
  }

  const tutorName = config?.tutor_name ?? `Tutor ${community.name}`
  const isEmpty = messages.length === 0

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      {showSidebar && (
        <div style={{ width: 256, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg1)' }}>
          {/* Header */}
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: `1px solid ${accent}33` }}>
                {community.logo_url ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} /> : '🌐'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{community.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Sparkles size={9} /> Tutor IA
                </div>
              </div>
            </div>
            <button onClick={startNewConversation}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--r-md)', background: `${accent}18`, border: `1px solid ${accent}33`, color: accent, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
              <Plus size={14} /> Nueva conversación
            </button>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                Sin conversaciones aún
              </div>
            ) : conversations.map(c => (
              <div key={c.id} onClick={() => loadConversation(c.id)}
                style={{ padding: '9px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer', marginBottom: 2, background: c.id === convId ? 'rgba(255,255,255,0.06)' : 'transparent', transition: 'background .12s' }}
                onMouseEnter={e => { if (c.id !== convId) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (c.id !== convId) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: c.id === convId ? 'var(--text)' : 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  {c.message_count} mensajes
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {isOwner && (
            <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setConfigMode(!configMode)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)', background: 'transparent', border: 'none', color: 'var(--muted2)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
                <Settings size={13} /> Configurar tutor
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MAIN CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── CONFIG MODE ── */}
        {configMode && isOwner ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <Settings size={20} color={accent} />
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 20 }}>Configurar Tutor IA</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                    Nombre del tutor
                  </label>
                  <input className="input" value={configForm.tutor_name}
                    onChange={e => setConfigForm(f => ({ ...f, tutor_name: e.target.value }))}
                    placeholder="Ej: Mentor Carlos, Asistente Pro, TutorBot..." />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                    Personalidad y tono
                  </label>
                  <textarea className="input" style={{ minHeight: 100 }} value={configForm.tutor_persona}
                    onChange={e => setConfigForm(f => ({ ...f, tutor_persona: e.target.value }))}
                    placeholder="Ej: Eres un mentor experto en marketing digital con 10 años de experiencia. Eres directo, práctico y usas ejemplos reales de LATAM..." />
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Define cómo responderá el tutor a tus miembros.</p>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                    Conocimiento del tutor
                  </label>
                  <textarea className="input" style={{ minHeight: 140 }} value={configForm.context_docs}
                    onChange={e => setConfigForm(f => ({ ...f, context_docs: e.target.value }))}
                    placeholder="Pega aquí el contenido que debe conocer el tutor: resúmenes de tus cursos, conceptos clave de tu comunidad, preguntas frecuentes, tu metodología, links importantes...

Cuanto más detallado, mejor responderá a tus miembros." />
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Este contexto se incluye en cada conversación. Máx. recomendado: 2,000 palabras.</p>
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                  <button onClick={saveConfig} className="btn-primary" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                    Guardar configuración
                  </button>
                  <button onClick={() => setConfigMode(false)} className="btn-secondary">Cancelar</button>
                </div>
              </div>
            </div>
          </div>

        ) : (
          <>
            {/* ── MESSAGES ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              <div style={{ maxWidth: 720, margin: '0 auto' }}>

                {/* Welcome state */}
                {isEmpty && (
                  <div style={{ textAlign: 'center', padding: '48px 0 32px' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: `${accent}18`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                      <Sparkles size={28} color={accent} />
                    </div>
                    <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 22, marginBottom: 8 }}>
                      {tutorName}
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--muted2)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 28px' }}>
                      Tu asistente de IA personal para {community.name}. Pregúntame sobre el contenido, conceptos o cualquier duda que tengas.
                    </p>
                    {/* Suggested questions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 500, margin: '0 auto' }}>
                      {SUGGESTED.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)}
                          style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'all .15s', lineHeight: 1.4 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.borderColor = `${accent}44` }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                      {/* Avatar */}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', background: m.role === 'assistant' ? `${accent}22` : 'var(--bg3)', border: m.role === 'assistant' ? `1px solid ${accent}33` : '1px solid var(--border2)', color: m.role === 'assistant' ? accent : 'var(--text2)' }}>
                        {m.role === 'assistant' ? <Sparkles size={15} /> : userProfile.name.slice(0, 2).toUpperCase()}
                      </div>
                      {/* Bubble */}
                      <div style={{ maxWidth: '75%' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, letterSpacing: '.04em', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                          {m.role === 'assistant' ? tutorName : 'Tú'}
                        </div>
                        <div style={{
                          padding: '12px 16px', borderRadius: m.role === 'assistant' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                          background: m.role === 'assistant' ? `linear-gradient(135deg, ${accent}12, ${accent}06)` : 'rgba(255,255,255,0.05)',
                          border: m.role === 'assistant' ? `1px solid ${accent}20` : '1px solid var(--border)',
                          fontSize: 14, lineHeight: 1.65, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {loading && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}22`, border: `1px solid ${accent}33` }}>
                        <Sparkles size={15} color={accent} />
                      </div>
                      <div style={{ padding: '14px 18px', borderRadius: '4px 14px 14px 14px', background: `${accent}0A`, border: `1px solid ${accent}20`, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div className="ai-typing" style={{ display: 'flex', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', animation: 'pulse-dot 1.2s ease-in-out infinite' }} />
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', animation: 'pulse-dot 1.2s ease-in-out 0.2s infinite' }} />
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', animation: 'pulse-dot 1.2s ease-in-out 0.4s infinite' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={bottomRef} />
              </div>
            </div>

            {/* ── INPUT ── */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 32px', background: 'var(--bg1)' }}>
              <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--bg2)', border: `1px solid var(--border2)`, borderRadius: 'var(--r-lg)', padding: '10px 14px', transition: 'border-color .15s, box-shadow .15s', boxShadow: 'none' }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}66`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${accent}12` }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                  <textarea ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder={`Pregunta algo sobre ${community.name}...`}
                    disabled={loading}
                    rows={1}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'Inter, sans-serif', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflow: 'auto', padding: 0 }} />
                  <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                    style={{ width: 34, height: 34, borderRadius: 10, background: input.trim() && !loading ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : 'var(--bg3)', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                    <Send size={15} color={input.trim() && !loading ? '#fff' : 'var(--muted)'} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
                  Enter para enviar · Shift+Enter para nueva línea
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
