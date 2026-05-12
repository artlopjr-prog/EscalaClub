import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LiveClient from './LiveClient'

export default async function LivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('id, name, slug, primary_color, owner_id')
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

  const { data: sessions } = await supabase
    .from('ec_live_sessions')
    .select('*')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return <LiveClient community={community} sessions={sessions ?? []} userId={user.id} isOwner={isOwner} />
}
