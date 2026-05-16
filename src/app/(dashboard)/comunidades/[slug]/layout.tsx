import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CommunityShell from './CommunityShell'
import { headers } from 'next/headers'

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

  // La landing /comunidades/[slug] es pública
  // Las subrutas (/foro, /chat, /cursos, etc.) requieren auth
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  const isSubroute = /\/comunidades\/[^\/]+\/.+/.test(pathname)

  if (!user && isSubroute) {
    redirect(`/login?redirect=/comunidades/${slug}${pathname.split(`/comunidades/${slug}`)[1] || ''}`)
  }

  const { data: community } = await supabase
    .from('ec_communities')
    .select('*')
    .eq('slug', slug)
    .single()
  if (!community) notFound()

  // Si no hay usuario, renderizar sin shell (landing pública)
  if (!user) {
    return <>{children}</>
  }

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
