import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventosClient from './EventosClient'

export default async function EventosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('role_platform')
    .eq('id', user.id)
    .maybeSingle()

  const isSuperAdmin = profile?.role_platform === 'super_admin'

  const { data } = await supabase
    .from('ec_communities')
    .select('id, name, primary_color')
    .eq('owner_id', user.id)
  const ownedCommunities = data ?? []

  const isCreator = isSuperAdmin || ownedCommunities.length > 0

  const { data: memberships } = await supabase
    .from('ec_community_members')
    .select('community_id')
    .eq('user_id', user.id)

  const communityIds = [
    ...(memberships?.map(m => m.community_id) ?? []),
    ...(ownedCommunities.map(c => c.id)),
  ].filter((v, i, a) => a.indexOf(v) === i)

  const { data: events } = await supabase
    .from('ec_events')
    .select('*, community:ec_communities(id, name, slug, primary_color)')
    .in('community_id', communityIds.length > 0 ? communityIds : ['00000000-0000-0000-0000-000000000000'])
    .order('starts_at')

  const { data: rsvps } = await supabase
    .from('ec_event_rsvps')
    .select('event_id')
    .eq('user_id', user.id)

  return (
    <EventosClient
      events={events ?? []}
      rsvpIds={new Set(rsvps?.map(r => r.event_id) ?? [])}
      userId={user.id}
      ownedCommunities={ownedCommunities}
      isCreator={isCreator}
    />
  )
}
