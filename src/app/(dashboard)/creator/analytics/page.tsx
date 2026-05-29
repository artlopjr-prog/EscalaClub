import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('id, name, slug, primary_color, member_count')
    .eq('owner_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!community) redirect('/creator')

  // Get analytics data
  const { data: analytics } = await supabase
    .rpc('get_community_analytics', { p_community_id: community.id })

  // Get subscription revenue estimate
  const { data: subscriptions } = await supabase
    .from('ec_member_subscriptions')
    .select('plan, amount_usd, status')
    .eq('community_id', community.id)
    .eq('status', 'active')

  const monthlyRevenue = (subscriptions ?? []).reduce((sum, s) => sum + (s.amount_usd ?? 0), 0)

  // Get recent members
  const { data: recentMembers } = await supabase
    .from('ec_community_members')
    .select('user_id, joined_at, role, profile:ec_profiles(display_name, avatar_url)')
    .eq('community_id', community.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(8)

  return (
    <AnalyticsClient
      community={community}
      analytics={analytics ?? {}}
      monthlyRevenue={monthlyRevenue}
      recentMembers={recentMembers ?? []}
    />
  )
}
