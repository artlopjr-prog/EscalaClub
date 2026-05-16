import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import { sendPaymentConfirmedEmail, sendCreatorPaymentEmail, sendNewMemberEmail } from '@/lib/emails'

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID ?? ''

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })

  if (WEBHOOK_ID) {
    const valid = await verifyWebhookSignature(headers, body, WEBHOOK_ID)
    if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try { event = JSON.parse(body) }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const supabase = await createClient()
  const { event_type, resource } = event

  console.log(`PayPal webhook: ${event_type}`)

  switch (event_type) {

    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'PAYMENT.SALE.COMPLETED': {
      const subscriptionId = resource?.billing_agreement_id ?? resource?.id
      if (!subscriptionId) break

      // Check community membership
      const { data: membership } = await supabase
        .from('ec_community_members')
        .select('id, user_id, community_id, status')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      if (membership) {
        await supabase
          .from('ec_community_members')
          .update({ status: 'active', activated_at: new Date().toISOString() })
          .eq('id', membership.id)

        await supabase.rpc('increment_member_count', { community_id: membership.community_id })

        const { data: community } = await supabase
          .from('ec_communities')
          .select('name, slug, owner_id, price_monthly')
          .eq('id', membership.community_id)
          .single()

        const { data: memberProfile } = await supabase
          .from('ec_profiles')
          .select('display_name')
          .eq('id', membership.user_id)
          .single()

        // Get member email from auth
        const { data: memberAuth } = await supabase.auth.admin.getUserById(membership.user_id)
        const memberEmail = memberAuth?.user?.email ?? ''
        const memberName  = memberProfile?.display_name ?? 'Usuario'
        const amount      = community?.price_monthly ?? 0

        if (memberEmail && community) {
          await sendPaymentConfirmedEmail(memberEmail, memberName, community.name, amount, community.slug)
        }

        if (community?.owner_id) {
          const { data: creatorAuth } = await supabase.auth.admin.getUserById(community.owner_id)
          const { data: creatorProfile } = await supabase
            .from('ec_profiles').select('display_name').eq('id', community.owner_id).single()
          const { count } = await supabase
            .from('ec_community_members')
            .select('id', { count: 'exact', head: true })
            .eq('community_id', membership.community_id)
            .eq('status', 'active')

          if (creatorAuth?.user?.email) {
            await sendCreatorPaymentEmail(
              creatorAuth.user.email,
              creatorProfile?.display_name ?? 'Creador',
              memberName, community.name, amount, amount * 0.015
            )
            await sendNewMemberEmail(creatorAuth.user.email, community.name, memberName, count ?? 0)
          }
        }
        break
      }

      // Creator subscription
      const { data: sub } = await supabase
        .from('ec_creator_subscriptions')
        .select('id, member_id')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      if (sub) {
        await supabase
          .from('ec_creator_subscriptions')
          .update({ status: 'active', activated_at: new Date().toISOString() })
          .eq('id', sub.id)

        await supabase
          .from('ec_profiles')
          .update({ role_platform: 'instructor' })
          .eq('id', sub.member_id)
      }
      break
    }

    case 'BILLING.SUBSCRIPTION.RENEWED': {
      const subscriptionId = resource?.id
      if (!subscriptionId) break
      await supabase
        .from('ec_creator_subscriptions')
        .update({ status: 'active', last_payment_at: new Date().toISOString(), current_period_end: resource?.billing_info?.next_billing_time })
        .eq('paypal_subscription_id', subscriptionId)
      break
    }

    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.EXPIRED': {
      const subscriptionId = resource?.id
      if (!subscriptionId) break

      const { data: sub } = await supabase
        .from('ec_creator_subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)
        .select('id, member_id')
        .maybeSingle()

      if (sub) {
        const { data: others } = await supabase
          .from('ec_creator_subscriptions')
          .select('id').eq('member_id', sub.member_id).eq('status', 'active').neq('id', sub.id)
        if (!others?.length) {
          await supabase.from('ec_profiles').update({ role_platform: 'user' }).eq('id', sub.member_id)
        }
      }

      await supabase
        .from('ec_community_members')
        .update({ status: 'expired', expired_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)
      break
    }

    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
      const subscriptionId = resource?.id
      if (!subscriptionId) break
      await supabase.from('ec_creator_subscriptions').update({ status: 'past_due' }).eq('paypal_subscription_id', subscriptionId)
      await supabase.from('ec_community_members').update({ status: 'past_due' }).eq('paypal_subscription_id', subscriptionId)
      break
    }

    default:
      console.log(`PayPal event not handled: ${event_type}`)
  }

  return NextResponse.json({ received: true })
}
