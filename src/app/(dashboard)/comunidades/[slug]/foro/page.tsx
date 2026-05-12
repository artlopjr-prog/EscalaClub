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
    .select('id, name, slug, primary_color, owner_id, members_can_post, members_can_upload_images, members_can_upload_videos, chat_mode, qa_enabled')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('id, role')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isOwner = community.owner_id === user.id
  if (!membership && !isOwner) redirect(`/comunidades/${slug}`)

  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase.from('ec_posts')
      .select('*, author:ec_profiles(id, display_name, avatar_url)')
      .eq('community_id', community.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('ec_post_categories')
      .select('*')
      .eq('community_id', community.id)
      .order('position'),
  ])

  return (
    <ForoClient
      community={community}
      posts={posts ?? []}
      categories={categories ?? []}
      userId={user.id}
      userRole={isOwner ? 'owner' : (membership?.role ?? 'member')}
    />
  )
}
