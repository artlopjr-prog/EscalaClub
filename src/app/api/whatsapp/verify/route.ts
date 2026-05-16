import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsApp, TEMPLATES } from '../route'

// Genera código de 6 dígitos
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/whatsapp/verify — enviar código
// PUT  /api/whatsapp/verify — verificar código
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

  // Normalizar número
  const normalized = phone.replace(/\s/g, '').replace(/^00/, '+')
  if (!normalized.startsWith('+')) {
    return NextResponse.json({ error: 'Incluye el código de país, ej: +507...' }, { status: 400 })
  }

  const code = generateCode()
  const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Guardar código en DB
  await supabase.from('ec_notification_prefs').upsert({
    user_id: user.id,
    whatsapp_phone: normalized,
    whatsapp_verify_code: code,
    whatsapp_verified: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  // Enviar código por WhatsApp
  const result = await sendWhatsApp({
    to: normalized,
    type: 'text',
    text: TEMPLATES.verify_code(code),
  })

  if (!result.success) {
    return NextResponse.json({ error: `No se pudo enviar el mensaje: ${result.error}` }, { status: 500 })
  }

  return NextResponse.json({ sent: true, phone: normalized })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const { data: prefs } = await supabase
    .from('ec_notification_prefs')
    .select('whatsapp_verify_code, whatsapp_phone')
    .eq('user_id', user.id)
    .single()

  if (!prefs) return NextResponse.json({ error: 'No hay teléfono pendiente de verificación' }, { status: 400 })
  if (prefs.whatsapp_verify_code !== code) return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })

  // Marcar como verificado
  await supabase.from('ec_notification_prefs').update({
    whatsapp_verified: true,
    whatsapp_enabled: true,
    whatsapp_verified_at: new Date().toISOString(),
    whatsapp_verify_code: null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id)

  // Enviar mensaje de bienvenida
  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  await sendWhatsApp({
    to: prefs.whatsapp_phone,
    type: 'text',
    text: TEMPLATES.welcome(profile?.display_name ?? 'Usuario'),
  })

  return NextResponse.json({ verified: true })
}
