import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.from('ec_profiles').insert({
      id: user.id,
      username: user.email?.split('@')[0] ?? 'user',
      display_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
      role_platform: ['artlopjr@gmail.com','arturo@scalon.co','arturo@scalon.com'].includes(user.email ?? '') ? 'super_admin' : 'user',
      onboarding_completed: false,
    })
  }

  // Check if user is a creator (owns a community)
  const { data: ownedCommunity } = await supabase
    .from('ec_communities')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  const isCreator = !!ownedCommunity

  const { count: unread } = await supabase
    .from('ec_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const member = {
    id: profile?.id ?? user.id,
    username: profile?.username ?? user.email?.split('@')[0] ?? 'user',
    display_name: profile?.display_name ?? user.user_metadata?.full_name ?? 'Usuario',
    avatar_url: profile?.avatar_url,
    role_platform: profile?.role_platform ?? 'user',
    email: user.email ?? '',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#06060A' }}>
      <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
        <Sidebar user={member} unread={unread ?? 0} isCreator={isCreator} />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
