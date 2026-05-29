import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendCreatorWelcomeEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false })

    const { role } = await req.json()
    const { data: profile } = await supabase
      .from('ec_profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()

    const name = profile?.display_name ?? user.email?.split('@')[0] ?? 'Usuario'
    const email = user.email!

    if (role === 'creator') {
      await sendCreatorWelcomeEmail(email, name)
    } else {
      await sendWelcomeEmail(email, name)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false })
  }
}
