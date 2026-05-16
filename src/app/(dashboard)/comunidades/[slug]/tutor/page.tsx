import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AITutorClient from './AITutorClient'

export default async function AITutorPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('id, name, description, category, logo_url, primary_color, owner_id')
    .eq('slug', params.slug)
    .single()

  if (!community) notFound()

  // Check membership
  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('role, status')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isMember = !!membership && membership.status === 'active'
  const isOwner = community.owner_id === user.id

  if (!isMember && !isOwner) redirect(`/comunidades/${params.slug}`)

  // Get tutor config
  const { data: config } = await supabase
    .from('ec_ai_tutor_config')
    .select('*')
    .eq('community_id', community.id)
    .maybeSingle()

  // Get user's recent conversations
  const { data: conversations } = await supabase
    .from('ec_ai_conversations')
    .select('id, title, message_count, created_at')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get profile
  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <AITutorClient
      userId={user.id}
      community={community}
      config={config}
      conversations={conversations ?? []}
      isOwner={isOwner}
      userProfile={{ name: profile?.display_name ?? 'Tú', avatar: profile?.avatar_url }}
    />
  )
}
