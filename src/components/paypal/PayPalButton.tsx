'use client'

import { useEffect, useRef, useState } from 'react'
import { PAYPAL_CLIENT_ID, SANDBOX_MODE, getPlanId } from '@/lib/paypal'

interface PayPalButtonProps {
  planTier: 'starter' | 'creator' | 'pro'
  billingCycle: 'monthly' | 'annual'
  onSuccess: (subscriptionId: string) => void
  onError?: (err: unknown) => void
  onCancel?: () => void
  disabled?: boolean
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function PayPalButton({
  planTier,
  billingCycle,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<{ close: () => void } | null>(null)

  useEffect(() => {
    if (disabled) return

    const scriptId = 'paypal-sdk'
    const existing = document.getElementById(scriptId)

    const initButtons = () => {
      if (!window.paypal || !containerRef.current) return

      // Clear previous render
      containerRef.current.innerHTML = ''

      const planId = getPlanId(planTier, billingCycle)

      try {
        const btn = window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          createSubscription: (_data: unknown, actions: Record<string, unknown>) => {
            return (actions.subscription as Record<string, Function>).create({ plan_id: planId })
          },
          onApprove: (_data: Record<string, string>) => {
            onSuccess(_data.subscriptionID)
          },
          onError: (err: unknown) => {
            console.error('PayPal error:', err)
            setError('Error con PayPal. Intenta de nuevo.')
            onError?.(err)
          },
          onCancel: () => {
            onCancel?.()
          },
        })

        btn.render(`#paypal-btn-${planTier}-${billingCycle}`)
        buttonRef.current = btn
        setLoaded(true)
      } catch (e) {
        console.error('PayPal render error:', e)
        setError('No se pudo cargar PayPal.')
      }
    }

    if (!existing) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription&currency=USD`
      script.setAttribute('data-sdk-integration-source', 'button-factory')
      script.onload = initButtons
      script.onerror = () => setError('No se pudo cargar PayPal SDK.')
      document.body.appendChild(script)
    } else {
      initButtons()
    }

    return () => {
      buttonRef.current?.close?.()
    }
  }, [planTier, billingCycle, disabled])

  if (disabled) {
    return (
      <button disabled className="w-full py-3 rounded-xl bg-white/10 text-white/40 cursor-not-allowed font-medium">
        Selecciona un plan primero
      </button>
    )
  }

  if (error) {
    return (
      <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
        {error}
        <button onClick={() => setError(null)} className="block w-full mt-2 text-red-300 underline">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {SANDBOX_MODE && (
        <div className="mb-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs text-center">
          🧪 Modo Sandbox — Pagos de prueba activos
        </div>
      )}
      {!loaded && (
        <div className="w-full h-12 rounded-xl bg-white/5 animate-pulse flex items-center justify-center text-white/40 text-sm">
          Cargando PayPal...
        </div>
      )}
      <div
        ref={containerRef}
        id={`paypal-btn-${planTier}-${billingCycle}`}
        className={loaded ? 'block' : 'hidden'}
      />
    </div>
  )
}
