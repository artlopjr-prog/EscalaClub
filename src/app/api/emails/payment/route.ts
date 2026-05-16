import { NextRequest, NextResponse } from 'next/server'
import { sendPaymentConfirmedEmail, sendCreatorPaymentEmail, sendNewMemberEmail } from '@/lib/emails'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { type, memberEmail, memberName, creatorEmail, creatorName, communityName, communitySlug, amount, memberCount } = await req.json()
  const FEE = amount * 0.015

  if (type === 'member_payment') {
    await sendPaymentConfirmedEmail(memberEmail, memberName, communityName, amount, communitySlug)
    if (creatorEmail) {
      await sendCreatorPaymentEmail(creatorEmail, creatorName, memberName, communityName, amount, FEE)
      await sendNewMemberEmail(creatorEmail, communityName, memberName, memberCount ?? 0)
    }
  }
  return NextResponse.json({ ok: true })
}
