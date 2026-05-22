import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paypalAPI } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { communityId, planId, returnUrl, cancelUrl } = await req.json()

    // Verificar que la comunidad existe y tiene precio
    const { data: community } = await supabase
      .from('ec_communities')
      .select('id, name, slug, price_monthly, price_annual, paypal_plan_id_monthly, paypal_plan_id_annual, owner_id')
      .eq('id', communityId)
      .single()

    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    if (!community.price_monthly || community.price_monthly === 0) return NextResponse.json({ error: 'Community is free' }, { status: 400 })

    const paypalPlanId = planId ?? community.paypal_plan_id_monthly
    if (!paypalPlanId) return NextResponse.json({ error: 'No PayPal plan configured for this community' }, { status: 400 })

    const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://komunio-artlopjr-progs-projects.vercel.app'

    // Crear suscripción en PayPal
    const subscription = await paypalAPI('POST', '/v1/billing/subscriptions', {
      plan_id: paypalPlanId,
      subscriber: {
        name: { given_name: user.user_metadata?.full_name?.split(' ')[0] ?? 'Usuario' },
        email_address: user.email,
      },
      application_context: {
        brand_name: 'Komunio',
        locale: 'es-PA',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl ?? `${BASE}/comunidades/${community.slug}?payment=success`,
        cancel_url: cancelUrl ?? `${BASE}/comunidades/${community.slug}?payment=cancelled`,
      },
    })

    // Guardar membresía pendiente en DB
    await supabase.from('ec_community_members').upsert({
      community_id: communityId,
      user_id: user.id,
      status: 'pending',
      paypal_subscription_id: subscription.id,
      role: 'member',
    }, { onConflict: 'community_id,user_id' })

    // URL de aprobación de PayPal
    const approvalUrl = subscription.links?.find((l: any) => l.rel === 'approve')?.href

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl,
      status: subscription.status,
    })
  } catch (e: any) {
    console.error('Create subscription error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
