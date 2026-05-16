import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JuegosClient from './JuegosClient'

export default async function JuegosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('display_name, avatar_url, xp, level, streak_days')
    .eq('id', user.id)
    .single()

  // Check if user already spun today
  const today = new Date().toISOString().split('T')[0]
  const { data: todaySpin } = await supabase
    .from('ec_daily_spins')
    .select('id, prize_type, prize_amount, spun_at')
    .eq('user_id', user.id)
    .gte('spun_at', today)
    .maybeSingle()

  // Top spin winners this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: topWinners } = await supabase
    .from('ec_daily_spins')
    .select('user_id, prize_type, prize_amount, spun_at, profile:ec_profiles(display_name, avatar_url)')
    .gte('spun_at', weekAgo)
    .eq('prize_type', 'jackpot')
    .order('spun_at', { ascending: false })
    .limit(5)

  return (
    <JuegosClient
      userId={user.id}
      profile={{
        name: profile?.display_name ?? 'Usuario',
        avatar: profile?.avatar_url,
        xp: profile?.xp ?? 0,
        level: profile?.level ?? 1,
        streak: profile?.streak_days ?? 0,
      }}
      todaySpin={todaySpin}
      topWinners={topWinners ?? []}
    />
  )
}
