import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RetosClient from './RetosClient'

export default async function RetosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile
  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('role_platform, display_name, avatar_url, country')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role_platform === 'super_admin'
  const isCreatorOrAdmin = isAdmin || profile?.role_platform === 'instructor'

  // Retos de plataforma activos y próximos
  const { data: platformChallenges } = await supabase
    .from('ec_challenges')
    .select(`
      id, title, description, emoji, challenge_type, duration_days,
      starts_at, ends_at, status, participant_count, origin,
      reward_badge, reward_xp, reward_xp_amount, reward_cert,
      reward_title, reward_free_month, reward_homepage, reward_insider,
      reward_role, reward_coupon, reward_content
    `)
    .eq('origin', 'platform')
    .in('status', ['active', 'upcoming'])
    .order('starts_at', { ascending: true })

  // Comunidades del usuario
  const { data: myMemberships } = await supabase
    .from('ec_community_members')
    .select('community_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const communityIds = myMemberships?.map(m => m.community_id) ?? []

  // Retos de mis comunidades
  const { data: communityChallenges } = await supabase
    .from('ec_challenges')
    .select(`
      id, title, description, emoji, challenge_type, duration_days,
      starts_at, ends_at, status, participant_count, origin, community_id,
      reward_badge, reward_xp, reward_xp_amount, reward_cert,
      reward_role, reward_coupon, reward_content,
      community:ec_communities(id, name, slug, primary_color)
    `)
    .eq('origin', 'community')
    .in('status', ['active', 'upcoming', 'ended'])
    .in('community_id', communityIds.length > 0 ? communityIds : ['00000000-0000-0000-0000-000000000000'])
    .order('starts_at', { ascending: false })
    .limit(20)

  // Mi participación en todos los retos
  const allChallengeIds = [
    ...(platformChallenges?.map(c => c.id) ?? []),
    ...(communityChallenges?.map(c => c.id) ?? []),
  ]

  const { data: myParticipations } = await supabase
    .from('ec_challenge_participants')
    .select('challenge_id, current_streak, max_streak, days_completed, status, last_check_at')
    .eq('user_id', user.id)
    .in('challenge_id', allChallengeIds.length > 0 ? allChallengeIds : ['00000000-0000-0000-0000-000000000000'])

  // Stats personales
  const totalStreak = myParticipations?.reduce((max, p) => Math.max(max, p.current_streak ?? 0), 0) ?? 0
  const activeCount = myParticipations?.filter(p => p.status === 'active').length ?? 0
  const totalXP = (myParticipations?.reduce((sum, p) => sum + (p.days_completed ?? 0), 0) ?? 0) * 10

  // Solo cargar comunidades propias si es creador o admin
  const { data: ownedCommunities } = isCreatorOrAdmin
    ? await supabase
        .from('ec_communities')
        .select('id, name, primary_color')
        .eq('owner_id', user.id)
        .eq('status', 'active')
    : { data: [] }

  // Puede crear retos: admin siempre, creador solo si tiene comunidades
  const canCreate = isAdmin || (isCreatorOrAdmin && (ownedCommunities?.length ?? 0) > 0)

  return (
    <RetosClient
      userId={user.id}
      userCountry={profile?.country ?? 'PA'}
      isAdmin={isAdmin}
      canCreate={canCreate}
      platformChallenges={platformChallenges ?? []}
      communityChallenges={(communityChallenges ?? []) as any}
      myParticipations={myParticipations ?? []}
      ownedCommunities={ownedCommunities ?? []}
      stats={{ totalStreak, activeCount, totalXP }}
    />
  )
}
