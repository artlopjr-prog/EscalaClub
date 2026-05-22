import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── CONFIGURACIÓN ──
// Soporta dos proveedores:
// 1. Twilio (recomendado, funciona en Panamá/LATAM)
// 2. Meta Cloud API (gratis, requiere Meta Business)
const PROVIDER = process.env.WA_PROVIDER ?? 'twilio' // 'twilio' | 'meta'

// ── TIPOS ──
type WAMessage = {
  to: string        // número con código de país, ej: +50761234567
  type: 'text' | 'template'
  text?: string
  template?: {
    name: string
    language: string
    components?: any[]
  }
}

// ── ENVIAR VÍA TWILIO ──
async function sendViaTwilio(msg: WAMessage): Promise<{ success: boolean; id?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WA_FROM ?? 'whatsapp:+14155238886' // Twilio sandbox

  if (!accountSid || !authToken) {
    return { success: false, error: 'Twilio credentials missing' }
  }

  const body = msg.type === 'text' ? msg.text! : formatTemplate(msg.template!)

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:${msg.to}`,
        Body: body,
      }),
    }
  )

  const data = await res.json()
  if (!res.ok) return { success: false, error: data.message }
  return { success: true, id: data.sid }
}

// ── ENVIAR VÍA META CLOUD API ──
async function sendViaMeta(msg: WAMessage): Promise<{ success: boolean; id?: string; error?: string }> {
  const token   = process.env.META_WA_TOKEN
  const phoneId = process.env.META_WA_PHONE_ID

  if (!token || !phoneId) {
    return { success: false, error: 'Meta credentials missing' }
  }

  const payload = msg.type === 'text'
    ? { messaging_product: 'whatsapp', to: msg.to, type: 'text', text: { body: msg.text } }
    : { messaging_product: 'whatsapp', to: msg.to, type: 'template', template: { name: msg.template!.name, language: { code: msg.template!.language }, components: msg.template!.components ?? [] } }

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  const data = await res.json()
  if (!res.ok) return { success: false, error: data.error?.message }
  return { success: true, id: data.messages?.[0]?.id }
}

// ── SEND ──
export async function sendWhatsApp(msg: WAMessage) {
  return PROVIDER === 'meta' ? sendViaMeta(msg) : sendViaTwilio(msg)
}

// ── TEMPLATES DE MENSAJES ──
function formatTemplate(t: { name: string; language: string; components?: any[] }): string {
  return `[Komunio] Tienes una nueva notificación`
}

export const TEMPLATES = {
  // Nuevo post en comunidad
  new_post: (communityName: string, postPreview: string, link: string) =>
    `🌐 *${communityName}* — Nuevo post\n\n"${postPreview.slice(0, 100)}${postPreview.length > 100 ? '...' : ''}"\n\n👉 Ver en Komunio: ${link}`,

  // Recordatorio de reto diario
  challenge_reminder: (challengeName: string, dayNum: number, streak: number, link: string) =>
    `⚡ *Reto: ${challengeName}*\n\n¿Ya marcaste tu día ${dayNum} de hoy?\n🔥 Tu racha actual: ${streak} días\n\n¡No rompas la racha! 👇\n${link}`,

  // Reto completado
  challenge_complete: (challengeName: string, totalDays: number, link: string) =>
    `🏆 *¡Felicitaciones!*\n\nCompletaste el reto *"${challengeName}"* — ${totalDays} días sin fallar.\n\n¡Eres parte de la élite de Komunio! 🌟\n${link}`,

  // Nuevo evento
  new_event: (communityName: string, eventTitle: string, date: string, link: string) =>
    `📅 *Nuevo evento en ${communityName}*\n\n*${eventTitle}*\n🗓 ${date}\n\n👉 Más info: ${link}`,

  // Badge obtenido
  new_badge: (badgeName: string, badgeEmoji: string, description: string, link: string) =>
    `${badgeEmoji} *¡Nuevo badge desbloqueado!*\n\n*${badgeName}*\n${description}\n\n👉 Ver tus badges: ${link}`,

  // Verificación de número
  verify_code: (code: string) =>
    `🔐 *Komunio* — Código de verificación\n\nTu código es: *${code}*\n\nVálido por 10 minutos. No lo compartas con nadie.`,

  // Spin diario recordatorio
  daily_spin: (link: string) =>
    `🎡 *¡Tu spin diario te espera!*\n\nGira la ruleta hoy y gana XP, badges y más premios.\n\n👉 ${link}`,

  // Bienvenida WhatsApp
  welcome: (userName: string) =>
    `👋 *¡Hola ${userName}!*\n\nWhatsApp conectado exitosamente con Komunio ✅\n\nAhora recibirás notificaciones de tus retos, eventos y comunidades directamente aquí.\n\n_Para dejar de recibir notificaciones ve a Configuración → Notificaciones en la plataforma._`,
}

// ── API ROUTE — enviar notificación ──
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { userId, type, data: msgData } = body

    // Solo admin o el mismo usuario puede enviar
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Obtener preferencias del usuario destino
    const { data: prefs } = await supabase
      .from('ec_notification_prefs')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!prefs?.whatsapp_enabled || !prefs?.whatsapp_verified || !prefs?.whatsapp_phone) {
      return NextResponse.json({ error: 'WhatsApp not enabled for this user' }, { status: 400 })
    }

    // Construir mensaje según tipo
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://komunio-artlopjr-progs-projects.vercel.app'
    let message = ''

    switch (type) {
      case 'new_post':
        if (!prefs.wa_new_post) return NextResponse.json({ skipped: true })
        message = TEMPLATES.new_post(msgData.communityName, msgData.postPreview, `${BASE_URL}/comunidades/${msgData.slug}/foro`)
        break
      case 'challenge_reminder':
        if (!prefs.wa_challenge_reminder) return NextResponse.json({ skipped: true })
        message = TEMPLATES.challenge_reminder(msgData.challengeName, msgData.dayNum, msgData.streak, `${BASE_URL}/retos`)
        break
      case 'challenge_complete':
        if (!prefs.wa_challenge_complete) return NextResponse.json({ skipped: true })
        message = TEMPLATES.challenge_complete(msgData.challengeName, msgData.totalDays, `${BASE_URL}/retos`)
        break
      case 'new_event':
        if (!prefs.wa_new_event) return NextResponse.json({ skipped: true })
        message = TEMPLATES.new_event(msgData.communityName, msgData.eventTitle, msgData.date, `${BASE_URL}/eventos`)
        break
      case 'new_badge':
        if (!prefs.wa_new_badge) return NextResponse.json({ skipped: true })
        message = TEMPLATES.new_badge(msgData.badgeName, msgData.badgeEmoji, msgData.description, `${BASE_URL}/badges`)
        break
      case 'daily_spin':
        if (!prefs.wa_daily_spin) return NextResponse.json({ skipped: true })
        message = TEMPLATES.daily_spin(`${BASE_URL}/juegos`)
        break
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
    }

    // Enviar
    const result = await sendWhatsApp({ to: prefs.whatsapp_phone, type: 'text', text: message })

    // Log
    await supabase.from('ec_notification_log').insert({
      user_id: userId,
      channel: 'whatsapp',
      type,
      content: message,
      status: result.success ? 'sent' : 'failed',
      external_id: result.id,
      error_msg: result.error,
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error('WhatsApp API error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
