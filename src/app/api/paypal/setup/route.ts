import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paypalAPI } from '@/lib/paypal'

// POST /api/paypal/setup
// Crea el producto y los 6 planes de suscripción en PayPal
// Solo puede llamarlo el admin

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('ec_profiles')
    .select('role_platform')
    .eq('id', user.id)
    .single()

  if (profile?.role_platform !== 'super_admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const results: Record<string, any> = {}

  try {
    // 1. Crear producto
    const product = await paypalAPI('POST', '/v1/catalogs/products', {
      name: 'Komunio Creator Subscription',
      description: 'Suscripción de creador en Komunio — La plataforma de comunidades de LATAM',
      type: 'SERVICE',
      category: 'SOFTWARE',
    })
    results.product_id = product.id
    console.log('Product created:', product.id)

    // 2. Crear los 6 planes
    const plans = [
      { key: 'starter_monthly', name: 'Starter Mensual',  price: '39.00',   interval: 'MONTH' },
      { key: 'starter_annual',  name: 'Starter Anual',    price: '374.00',  interval: 'YEAR'  },
      { key: 'creator_monthly', name: 'Creator Mensual',  price: '79.00',   interval: 'MONTH' },
      { key: 'creator_annual',  name: 'Creator Anual',    price: '758.00',  interval: 'YEAR'  },
      { key: 'pro_monthly',     name: 'Pro Mensual',       price: '129.00',  interval: 'MONTH' },
      { key: 'pro_annual',      name: 'Pro Anual',         price: '1238.00', interval: 'YEAR'  },
    ]

    for (const plan of plans) {
      const created = await paypalAPI('POST', '/v1/billing/plans', {
        product_id: product.id,
        name: `Komunio ${plan.name}`,
        description: `Plan ${plan.name} de Komunio para creadores de comunidades`,
        status: 'ACTIVE',
        billing_cycles: [{
          frequency: { interval_unit: plan.interval, interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: plan.price, currency_code: 'USD' },
          },
        }],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: '0', currency_code: 'USD' },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      })
      results[plan.key] = created.id
      console.log(`Plan ${plan.key} created:`, created.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Producto y planes creados exitosamente en PayPal',
      data: results,
      env_vars: `
Agrega estas variables en Vercel:

PAYPAL_PRODUCT_ID=${results.product_id}
NEXT_PUBLIC_PAYPAL_PLAN_STARTER_MONTHLY=${results.starter_monthly}
NEXT_PUBLIC_PAYPAL_PLAN_STARTER_ANNUAL=${results.starter_annual}
NEXT_PUBLIC_PAYPAL_PLAN_CREATOR_MONTHLY=${results.creator_monthly}
NEXT_PUBLIC_PAYPAL_PLAN_CREATOR_ANNUAL=${results.creator_annual}
NEXT_PUBLIC_PAYPAL_PLAN_PRO_MONTHLY=${results.pro_monthly}
NEXT_PUBLIC_PAYPAL_PLAN_PRO_ANNUAL=${results.pro_annual}
      `.trim()
    })
  } catch (e: any) {
    console.error('PayPal setup error:', e)
    return NextResponse.json({ error: e.message, partial: results }, { status: 500 })
  }
}
