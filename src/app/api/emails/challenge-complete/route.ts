import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendChallengeCompleteEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const { userId, challengeName, totalDays, badgeEmoji } = await req.json()
  const supabase = await createClient()
  const { data: profile } = await supabase.from('ec_profiles').select('display_name').eq('id', userId).single()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No email' }, { status: 400 })
  await sendChallengeCompleteEmail(user.email, profile?.display_name ?? 'Usuario', challengeName, totalDays, badgeEmoji ?? '🏆')
  return NextResponse.json({ ok: true })
}
