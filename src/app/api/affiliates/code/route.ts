import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check existing
  const { data: existing } = await supabase
    .from('ec_affiliate_codes')
    .select('code')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ code: existing.code })

  // Generate new
  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle()

  const username = profile?.username ?? profile?.display_name ?? 'user'
  const { data: code } = await supabase.rpc('generate_affiliate_code', {
    p_user_id: user.id,
    p_username: username
  })

  return NextResponse.json({ code })
}
