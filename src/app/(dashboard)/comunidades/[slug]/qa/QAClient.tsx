'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, ChevronUp, Check, Pin, Trash2, MessageCircle } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', gold: '#F0A500', red: '#FF4D6A' }

interface Question { id: string; question: string; answer?: string; author_id: string; answered_by?: string; answered_at?: string; is_pinned: boolean; upvotes: number; created_at: string; author?: any; answerer?: any }

export default function QAClient({ community, questions: initialQ, userId, isOwner, myUpvoteIds }: any) {
  const supabase = createClient()
  const [questions, setQuestions] = useState<Question[]>(initialQ)
  const [myUpvotes, setMyUpvotes] = useState<Set<string>>(myUpvoteIds)
  const [newQ, setNewQ] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [answerText, setAnswerText] = useState<Record<string, string>>({})
  const [showAnswer, setShowAnswer] = useState<string | null>(null)
  const accent = community.primary_color ?? '#7C3AED'

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'ahora'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  async function submitQuestion() {
    if (!newQ.trim()) return
    setSubmitting(true)
    const { data, error } = await supabase.from('ec_qa_questions')
      .insert({ community_id: community.id, author_id: userId, question: newQ.trim() })
      .select('*, author:ec_profiles(display_name, avatar_url)').single()
    if (error) { toast.error('Error: ' + error.message); setSubmitting(false); return }
    setQuestions([data as Question, ...questions])
    setNewQ('')
    setSubmitting(false)
    toast.success('¡Pregunta enviada! 🙋')
  }

  async function upvote(qId: string) {
    const hasVote = myUpvotes.has(qId)
    if (hasVote) {
      await supabase.from('ec_qa_upvotes').delete().eq('question_id', qId).eq('user_id', userId)
      setMyUpvotes(prev => { const n = new Set(prev); n.delete(qId); return n })
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, upvotes: q.upvotes - 1 } : q))
    } else {
      await supabase.from('ec_qa_upvotes').insert({ question_id: qId, user_id: userId })
      setMyUpvotes(prev => new Set([...prev, qId]))
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, upvotes: q.upvotes + 1 } : q))
    }
  }

  async function submitAnswer(qId: string) {
    const text = answerText[qId]?.trim()
    if (!text) return
    const { error } = await supabase.from('ec_qa_questions').update({ answer: text, answered_by: userId, answered_at: new Date().toISOString() }).eq('id', qId)
    if (error) { toast.error('Error'); return }
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answer: text, answered_at: new Date().toISOString() } : q))
    setAnswerText(prev => ({ ...prev, [qId]: '' }))
    setShowAnswer(null)
    toast.success('Respuesta publicada ✅')
  }

  async function togglePin(qId: string, pinned: boolean) {
    await supabase.from('ec_qa_questions').update({ is_pinned: !pinned }).eq('id', qId)
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, is_pinned: !pinned } : q))
  }

  async function deleteQ(qId: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await supabase.from('ec_qa_questions').delete().eq('id', qId)
    setQuestions(prev => prev.filter(q => q.id !== qId))
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href={`/comunidades/${community.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, textDecoration: 'none', fontSize: 12, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}` }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 16, color: C.text, flex: 1 }}>❓ Q&A — {community.name}</h1>
        <span style={{ fontSize: 11, color: C.muted }}>{questions.length} preguntas</span>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
        {/* Ask */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>🙋 Hacer una pregunta</div>
          <textarea value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="¿Qué quieres preguntarle al creador?" rows={3} style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Outfit, sans-serif' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button onClick={submitQuestion} disabled={submitting || !newQ.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: newQ.trim() ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : 'rgba(255,255,255,0.06)', color: newQ.trim() ? '#fff' : C.muted, border: 'none', cursor: newQ.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>
              <Send size={13} /> {submitting ? 'Enviando...' : 'Preguntar'}
            </button>
          </div>
        </div>

        {/* Questions */}
        {questions.length > 0 ? questions.map(q => (
          <div key={q.id} style={{ background: C.bg1, border: `2px solid ${q.is_pinned ? accent + '44' : q.answer ? 'rgba(0,214,143,0.2)' : C.border}`, borderRadius: 20, padding: 18, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {/* Upvote */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, paddingTop: 4 }}>
                <button onClick={() => upvote(q.id)} style={{ background: myUpvotes.has(q.id) ? accent + '20' : 'rgba(255,255,255,0.05)', border: `1px solid ${myUpvotes.has(q.id) ? accent : C.border}`, borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: myUpvotes.has(q.id) ? accent : C.muted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <ChevronUp size={14} />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{q.upvotes}</span>
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{q.author?.display_name ?? 'Usuario'}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(q.created_at)}</span>
                    {q.is_pinned && <span style={{ fontSize: 10, color: accent, fontWeight: 700 }}>📌 Destacada</span>}
                    {q.answer && <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✅ Respondida</span>}
                  </div>
                  {isOwner && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => togglePin(q.id, q.is_pinned)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: q.is_pinned ? accent : C.muted, padding: 4, borderRadius: 6, display: 'flex' }}>
                        <Pin size={13} />
                      </button>
                      <button onClick={() => deleteQ(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, borderRadius: 6, display: 'flex' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 14, color: C.text, margin: '0 0 12px', lineHeight: 1.6 }}>{q.question}</p>

                {q.answer && (
                  <div style={{ background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.15)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 6 }}>✅ Respuesta del creador</div>
                    <p style={{ fontSize: 13, color: C.muted2, margin: 0, lineHeight: 1.6 }}>{q.answer}</p>
                  </div>
                )}

                {isOwner && !q.answer && (
                  <div>
                    {showAnswer === q.id ? (
                      <div style={{ marginTop: 10 }}>
                        <textarea value={answerText[q.id] ?? ''} onChange={e => setAnswerText(p => ({ ...p, [q.id]: e.target.value }))} placeholder="Escribe tu respuesta..." rows={3} style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, outline: 'none', resize: 'none' }} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={() => submitAnswer(q.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 9, background: C.green, color: '#000', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>
                            <Check size={13} /> Publicar respuesta
                          </button>
                          <button onClick={() => setShowAnswer(null)} style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', color: C.muted, border: 'none', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAnswer(q.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.2)', color: C.green, cursor: 'pointer', fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                        <MessageCircle size={13} /> Responder
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Sin preguntas aún</h3>
            <p style={{ fontSize: 14, color: C.muted }}>Sé el primero en hacer una pregunta</p>
          </div>
        )}
      </div>
    </div>
  )
}
