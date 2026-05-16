import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotificacionesClient from './NotificacionesClient'

export default async function NotificacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: prefs }, { data: profile }, { data: recentLogs }] = await Promise.all([
    supabase.from('ec_notification_prefs').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('ec_profiles').select('display_name, avatar_url').eq('id', user.id).single(),
    supabase.from('ec_notification_log')
      .select('type, channel, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <NotificacionesClient
      userId={user.id}
      prefs={prefs}
      profile={profile}
      recentLogs={recentLogs ?? []}
    />
  )
}
