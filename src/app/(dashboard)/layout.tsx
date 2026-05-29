import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationBell } from '@/components/NotificationBell'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // /comunidades y /comunidades/[slug] son públicas — no redirigir
  // El middleware ya maneja la redirección para rutas privadas
  if (!user) {
    // Permitir acceso sin auth — el middleware ya filtró las rutas privadas
    return <>{children}</>
  }

  let { data: profile } = await supabase
    .from('ec_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const isAdminEmail = ['artlopjr@gmail.com','arturo@scalon.co','arturo@scalon.com',
      'alopezvierk@gmail.com','artlopjr2510@gmail.com'].includes(user.email ?? '')
    const { data: newProfile } = await supabase
      .from('ec_profiles')
      .insert({
        id: user.id,
        username: user.email?.split('@')[0] ?? 'user',
        display_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
        role_platform: isAdminEmail ? 'super_admin' : 'user',
        onboarding_completed: false,
      })
      .select()
      .single()
    profile = newProfile
  }

  const isSuperAdmin = profile?.role_platform === 'super_admin'
  const isInstructor = profile?.role_platform === 'instructor'

  // isCreator: solo super_admin o instructor con comunidad activa
  // Un usuario con role 'user' NUNCA ve el panel creador aunque tenga comunidades
  let isCreator = false
  if (isSuperAdmin) {
    isCreator = true
  } else if (isInstructor) {
    const { data: ownedCommunity } = await supabase
      .from('ec_communities')
      .select('id')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    isCreator = !!ownedCommunity
  }

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
    <>
    <style>{`
      @media (max-width: 767px) {
        .desktop-sidebar { display: none !important; }
        main { padding-bottom: 80px; }
      }
    `}</style>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar — hidden on mobile via CSS */}
      <div className="desktop-sidebar" style={{ flexShrink: 0 }}>
        <Sidebar user={member} unread={unread ?? 0} isCreator={isCreator} />
      </div>
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar with notification bell */}
        <div className="desktop-only" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px 0', flexShrink: 0 }}>
          <NotificationBell userId={user.id} />
        </div>
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
    </>
  )
}
