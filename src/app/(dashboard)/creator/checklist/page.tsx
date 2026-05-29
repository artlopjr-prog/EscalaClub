import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreatorChecklistClient from './CreatorChecklistClient'

export default async function CreatorChecklistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('display_name, avatar_url, role_platform')
    .eq('id', user.id)
    .single()

  const { data: community } = await supabase
    .from('ec_communities')
    .select('id, name, slug, logo_url, banner_url, description, tagline, price_monthly, intro_video_url, social_instagram, welcome_message')
    .eq('owner_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const { data: courses } = await supabase
    .from('ec_courses')
    .select('id')
    .eq('instructor_id', user.id)
    .limit(1)

  const { data: events } = await supabase
    .from('ec_events')
    .select('id')
    .eq('community_id', community?.id ?? '')
    .limit(1)

  const checklist = {
    has_community: !!community,
    has_logo: !!community?.logo_url,
    has_banner: !!community?.banner_url,
    has_description: !!(community?.description && community.description.length > 20),
    has_price: !!(community?.price_monthly && community.price_monthly > 0),
    has_video: !!community?.intro_video_url,
    has_social: !!community?.social_instagram,
    has_welcome: !!community?.welcome_message,
    has_course: !!(courses && courses.length > 0),
    has_event: !!(events && events.length > 0),
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = Object.keys(checklist).length

  return (
    <CreatorChecklistClient
      profile={profile}
      community={community}
      checklist={checklist}
      completedCount={completedCount}
      totalCount={totalCount}
    />
  )
}
