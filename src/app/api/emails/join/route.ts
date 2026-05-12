import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendJoinCommunityEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { communityName, communitySlug } = await req.json()
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: true })
  const { data: profile } = await supabase.from('ec_profiles').select('display_name').eq('id', user.id).single()
  try {
    await sendJoinCommunityEmail(user.email!, profile?.display_name ?? 'Miembro', communityName, communitySlug)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
