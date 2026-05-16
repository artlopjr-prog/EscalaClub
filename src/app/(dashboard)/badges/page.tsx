import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BadgesClient from './BadgesClient'

export default async function BadgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: allBadges },
    { data: myBadges },
    { data: profile },
    { data: topHolders },
  ] = await Promise.all([
    supabase.from('ec_badges').select('*').eq('is_active', true).not('slug', 'is', null).order('rarity'),
    supabase.from('ec_user_badges').select('badge_id, created_at, note').eq('user_id', user.id),
    supabase.from('ec_profiles').select('display_name, avatar_url, xp, level').eq('id', user.id).single(),
    supabase.from('ec_user_badges')
      .select('user_id, profile:ec_profiles(display_name, avatar_url)')
      .limit(5),
  ])

  const myBadgeIds = new Set((myBadges ?? []).map((b: any) => b.badge_id))
  const badgesWithStatus = (allBadges ?? []).map((b: any) => ({
    ...b,
    earned: myBadgeIds.has(b.id),
    earned_at: (myBadges ?? []).find((mb: any) => mb.badge_id === b.id)?.created_at,
  }))

  return (
    <BadgesClient
      userId={user.id}
      badges={badgesWithStatus}
      earnedCount={myBadgeIds.size}
      totalCount={allBadges?.length ?? 0}
      profile={profile}
    />
  )
}
