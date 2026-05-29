import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CertificadosClient from './CertificadosClient'

export default async function CertificadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: certificates } = await supabase
    .from('ec_certificates')
    .select(`
      id, certificate_number, issued_at,
      course:ec_courses(id, title, emoji, description,
        instructor:ec_profiles!ec_courses_instructor_id_fkey(display_name)),
      community:ec_communities(name, logo_url, primary_color)
    `)
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return (
    <CertificadosClient
      certificates={certificates ?? []}
      userName={profile?.display_name ?? 'Usuario'}
    />
  )
}
