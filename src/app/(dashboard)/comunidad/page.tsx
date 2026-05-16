import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Globe, MessageSquare } from 'lucide-react'

export default async function ComunidadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's first community
  const { data: membership } = await supabase
    .from('ec_community_members')
    .select('community_id, community:ec_communities(id,name,slug,primary_color)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!membership?.community_id) {
    return (
      <div style={{ padding: 32, textAlign: 'center', maxWidth: 500, margin: '80px auto' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 24, color: '#EEEDF5', marginBottom: 12 }}>Sin comunidades aún</h2>
        <p style={{ fontSize: 15, color: '#6B6A80', marginBottom: 24, lineHeight: 1.6 }}>Únete a una comunidad para acceder a su foro y conectar con sus miembros.</p>
        <Link href="/comunidades" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>
          <Globe size={16} /> Explorar comunidades
        </Link>
      </div>
    )
  }

  const community = membership.community as any
  redirect(`/comunidades/${community.slug}/foro`)
}
