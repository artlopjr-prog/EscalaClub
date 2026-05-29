import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { code } = await req.json()
  if (!code) return NextResponse.json({ ok: false })

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const ipHash = Buffer.from(ip).toString('base64').slice(0, 16)

  await supabase.from('ec_affiliate_clicks').insert({
    code,
    referrer: req.headers.get('referer') ?? null,
    ip_hash: ipHash,
  })

  return NextResponse.json({ ok: true })
}
