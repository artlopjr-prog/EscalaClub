import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import QAClient from './QAClient'

export default async function QAPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: community } = await supabase
    .from('ec_communities')
    .select('id, name, slug, primary_color, owner_id, qa_enabled')
    .eq('slug', slug).single()
  if (!community) notFound()

  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('id, role').eq('community_id', community.id).eq('user_id', user.id).maybeSingle()

  const isOwner = community.owner_id === user.id
  if (!membership && !isOwner) redirect(`/comunidades/${slug}`)
  if (!community.qa_enabled && !isOwner) redirect(`/comunidades/${slug}`)

  const { data: questions } = await supabase
    .from('ec_qa_questions')
    .select('*, author:ec_profiles(display_name, avatar_url), answerer:ec_profiles!ec_qa_questions_answered_by_fkey(display_name)')
    .eq('community_id', community.id)
    .order('is_pinned', { ascending: false })
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: myUpvotes } = await supabase
    .from('ec_qa_upvotes').select('question_id').eq('user_id', user.id)

  return <QAClient community={community} questions={questions ?? []} userId={user.id} isOwner={isOwner} myUpvoteIds={new Set(myUpvotes?.map(u => u.question_id) ?? [])} />
}
