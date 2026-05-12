import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('id, name, slug, primary_color, owner_id, chat_mode')
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

  const { data: messages } = await supabase
    .from('ec_chat_messages')
    .select('*, author:ec_profiles(id, display_name, avatar_url)')
    .eq('community_id', community.id)
    .order('created_at')
    .limit(100)

  const { data: profile } = await supabase.from('ec_profiles').select('display_name, avatar_url').eq('id', user.id).single()

  return (
    <ChatClient
      community={community}
      messages={messages ?? []}
      userId={user.id}
      userProfile={profile ?? { display_name: 'Usuario', avatar_url: null }}
      isOwner={isOwner}
      userRole={membership?.role ?? 'member'}
    />
  )
}
