import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  // Check if already has certificate
  const { data: existing } = await supabase
    .from('ec_certificates')
    .select('id, certificate_number, issued_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing) return NextResponse.json({ certificate: existing })

  // Check course completion
  const { data: completion } = await supabase
    .rpc('check_course_completion', { p_user_id: user.id, p_course_id: courseId })

  if (!completion) {
    return NextResponse.json({ error: 'Course not completed yet' }, { status: 400 })
  }

  // Issue certificate
  const { data: certId } = await supabase
    .rpc('issue_certificate', { p_user_id: user.id, p_course_id: courseId })

  const { data: cert } = await supabase
    .from('ec_certificates')
    .select('id, certificate_number, issued_at')
    .eq('id', certId)
    .single()

  return NextResponse.json({ certificate: cert })
}
