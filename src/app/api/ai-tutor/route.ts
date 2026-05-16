import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, communityId, conversationId } = await req.json()
    if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 })

    // Get community + tutor config
    const [{ data: community }, { data: config }] = await Promise.all([
      supabase.from('ec_communities').select('name, description, category').eq('id', communityId).single(),
      supabase.from('ec_ai_tutor_config').select('*').eq('community_id', communityId).maybeSingle(),
    ])

    // Build system prompt with community context
    const systemPrompt = config?.tutor_persona
      ? `${config.tutor_persona}

Eres el asistente de IA de la comunidad "${community?.name}" en EscalaClub — la plataforma de comunidades y cursos para LATAM.

Comunidad: ${community?.name}
Descripción: ${community?.description ?? 'Comunidad de aprendizaje'}
Categoría: ${community?.category ?? 'General'}

${config.context_docs ? `Información adicional del creador:\n${config.context_docs}` : ''}

Responde siempre en español, con un tono ${config?.tutor_name === 'Asistente' ? 'profesional pero cercano' : 'acorde al nombre ' + config.tutor_name}. 
Sé conciso pero completo. Usa ejemplos prácticos cuando sea útil.
Si no sabes algo específico de la comunidad, dilo honestamente y ofrece orientación general.`
      : `Eres el asistente de IA de la comunidad "${community?.name}" en EscalaClub, la plataforma líder de comunidades y cursos para LATAM.

Ayudas a los miembros con preguntas sobre el contenido de la comunidad, conceptos relacionados con ${community?.category ?? 'el tema de la comunidad'}, y navegación de la plataforma.

Responde siempre en español, con tono profesional y amigable. Sé preciso y útil.`

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const assistantMessage = data.content?.[0]?.text ?? 'Lo siento, no pude generar una respuesta.'
    const tokensUsed = data.usage?.output_tokens ?? 0

    // Save to DB if conversationId provided
    if (conversationId) {
      const userMsg = messages[messages.length - 1]
      await supabase.from('ec_ai_messages').insert([
        { conversation_id: conversationId, role: 'user', content: userMsg.content },
        { conversation_id: conversationId, role: 'assistant', content: assistantMessage, tokens_used: tokensUsed },
      ])
      await supabase.from('ec_ai_conversations')
        .update({ message_count: (messages.length + 1), title: messages[0]?.content?.slice(0, 60) })
        .eq('id', conversationId)
    }

    return NextResponse.json({ message: assistantMessage, tokens: tokensUsed })
  } catch (e) {
    console.error('AI tutor error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
