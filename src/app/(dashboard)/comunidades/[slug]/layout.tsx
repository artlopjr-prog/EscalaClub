import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CommunityShell from './CommunityShell'

export default async function CommunitySlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('*')
    .eq('slug', slug)
    .single()
  if (!community) notFound()

  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('role, status')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: ownerProfile } = await supabase
    .from('ec_profiles')
    .select('display_name, avatar_url')
    .eq('id', community.owner_id)
    .maybeSingle()

  const isOwner = community.owner_id === user.id
  const isMember = isOwner || (!!membership && membership.status === 'active')

  return (
    <CommunityShell
      community={community}
      ownerProfile={ownerProfile ?? null}
      isOwner={isOwner}
      isMember={isMember}
    >
      {children}
    </CommunityShell>
  )
}
