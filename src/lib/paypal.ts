// PayPal SDK loader & utilities
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb' // 'sb' = sandbox mode

export const SANDBOX_MODE = !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === 'sb' ||
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.startsWith('SANDBOX')

export interface PayPalSubscriptionResult {
  subscriptionID: string
  orderID?: string
  status: 'APPROVED' | 'CANCELLED' | 'ERROR'
}

// Creator plan PayPal Plan IDs (set when you have real PayPal business account)
export const CREATOR_PAYPAL_PLANS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_PP_STARTER_MONTHLY || 'P-SANDBOX-STARTER-MONTHLY',
    annual:  process.env.NEXT_PUBLIC_PP_STARTER_ANNUAL  || 'P-SANDBOX-STARTER-ANNUAL',
  },
  creator: {
    monthly: process.env.NEXT_PUBLIC_PP_CREATOR_MONTHLY || 'P-SANDBOX-CREATOR-MONTHLY',
    annual:  process.env.NEXT_PUBLIC_PP_CREATOR_ANNUAL  || 'P-SANDBOX-CREATOR-ANNUAL',
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_PP_PRO_MONTHLY || 'P-SANDBOX-PRO-MONTHLY',
    annual:  process.env.NEXT_PUBLIC_PP_PRO_ANNUAL  || 'P-SANDBOX-PRO-ANNUAL',
  },
}

export function getPlanId(tier: string, cycle: 'monthly' | 'annual'): string {
  return CREATOR_PAYPAL_PLANS[tier]?.[cycle] || 'P-SANDBOX'
}

export const PLAN_PRICES: Record<string, Record<string, number>> = {
  starter: { monthly: 39,   annual: 374 },
  creator: { monthly: 79,   annual: 758 },
  pro:     { monthly: 129,  annual: 1238 },
}

export function getYearlySavings(tier: string): number {
  const monthly = PLAN_PRICES[tier]?.monthly || 0
  const annual  = PLAN_PRICES[tier]?.annual  || 0
  return Math.round((monthly * 12 - annual))
}
