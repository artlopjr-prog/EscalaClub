import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ForoClient from './ForoClient'

export default async function ForoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  if (!community) notFound()

  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('role, status')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isOwner = community.owner_id === user.id
  const isMember = !!membership && membership.status === 'active'
  if (!isOwner && !isMember) redirect(`/comunidades/${slug}`)

  const userRole = isOwner ? 'owner' : (membership?.role ?? 'member')

  const [{ data: posts }, { data: categories }, { data: ownerProfile }, { data: profile }] = await Promise.all([
    supabase.from('ec_posts')
      .select('*, author:ec_profiles(id, display_name, avatar_url)')
      .eq('community_id', community.id)
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('ec_post_categories')
      .select('*')
      .eq('community_id', community.id)
      .order('sort_order'),
    supabase.from('ec_profiles')
      .select('display_name, avatar_url')
      .eq('id', community.owner_id)
      .maybeSingle(),
    supabase.from('ec_profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  return (
    <ForoClient
      community={community}
      posts={posts ?? []}
      categories={categories ?? []}
      userId={user.id}
      userRole={userRole}
      ownerProfile={ownerProfile ?? null}
      memberCount={community.member_count ?? 0}
      userDisplayName={profile?.display_name ?? user.email?.split('@')[0] ?? 'Usuario'}
      userAvatarUrl={profile?.avatar_url}
    />
  )
}
