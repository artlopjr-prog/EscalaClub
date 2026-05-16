import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Groq models disponibles:
// llama-3.3-70b-versatile  — mejor calidad, recomendado
// llama-3.1-8b-instant     — más rápido
// mixtral-8x7b-32768       — contexto largo
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, communityId, conversationId } = await req.json()
    if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 })

    const [{ data: community }, { data: config }] = await Promise.all([
      supabase.from('ec_communities').select('name, description, category').eq('id', communityId).single(),
      supabase.from('ec_ai_tutor_config').select('*').eq('community_id', communityId).maybeSingle(),
    ])

    const systemPrompt = config?.tutor_persona
      ? `${config.tutor_persona}

Eres el asistente de IA de la comunidad "${community?.name}" en EscalaClub — la plataforma de comunidades y cursos para LATAM.
Comunidad: ${community?.name} | Categoría: ${community?.category ?? 'General'}
${config.context_docs ? `\nConocimiento base:\n${config.context_docs}` : ''}

Responde siempre en español. Tono: ${config?.tutor_name && config.tutor_name !== 'Asistente' ? `acorde al personaje "${config.tutor_name}"` : 'profesional pero cercano'}.
Sé conciso pero completo. Usa ejemplos prácticos de LATAM.`
      : `Eres el tutor de IA de la comunidad "${community?.name}" en EscalaClub, la plataforma líder de comunidades y cursos para LATAM.
Ayudas a los miembros con preguntas sobre ${community?.category ?? 'el tema de la comunidad'} y cómo aprovechar la plataforma.
Responde siempre en español, con tono profesional y amigable. Sé preciso y útil.`

    // Groq API — formato compatible con OpenAI
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY ?? ''}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content ?? 'Lo siento, no pude generar una respuesta.'
    const tokensUsed = data.usage?.completion_tokens ?? 0

    if (conversationId) {
      const userMsg = messages[messages.length - 1]
      await supabase.from('ec_ai_messages').insert([
        { conversation_id: conversationId, role: 'user', content: userMsg.content },
        { conversation_id: conversationId, role: 'assistant', content: assistantMessage, tokens_used: tokensUsed },
      ])
      await supabase.from('ec_ai_conversations')
        .update({ message_count: messages.length + 1, title: messages[0]?.content?.slice(0, 60) ?? 'Conversación' })
        .eq('id', conversationId)
    }

    return NextResponse.json({ message: assistantMessage, tokens: tokensUsed })
  } catch (e) {
    console.error('AI tutor error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
