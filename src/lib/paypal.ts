const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? ''
const SECRET    = process.env.PAYPAL_SECRET    ?? ''

export async function getPayPalToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export async function paypalAPI(method: string, path: string, body?: any) {
  const token = await getPayPalToken()
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(`PayPal ${method} ${path}: ${JSON.stringify(data)}`)
  return data
}

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
  webhookId: string
): Promise<boolean> {
  try {
    const token = await getPayPalToken()
    const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo:         headers['paypal-auth-algo'],
        cert_url:          headers['paypal-cert-url'],
        transmission_id:   headers['paypal-transmission-id'],
        transmission_sig:  headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(body),
      }),
    })
    const data = await res.json()
    return data.verification_status === 'SUCCESS'
  } catch { return false }
}

// ── EXPORTS compatibles con PayPalButton y PricingPage ──
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''
export const SANDBOX_MODE = process.env.PAYPAL_MODE !== 'live'

export const PLAN_PRICES = {
  starter: { monthly: 39, annual: 374 },
  creator: { monthly: 79, annual: 758 },
  pro:     { monthly: 129, annual: 1238 },
}

export function getYearlySavings(tier: 'starter'|'creator'|'pro') {
  const p = PLAN_PRICES[tier]
  return Math.round(p.monthly * 12 - p.annual)
}

export function getPlanId(tier: 'starter'|'creator'|'pro', cycle: 'monthly'|'annual'): string {
  const key = `NEXT_PUBLIC_PAYPAL_PLAN_${tier.toUpperCase()}_${cycle.toUpperCase()}`
  return process.env[key] ?? ''
}
