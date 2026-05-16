'use client'
import { useState } from 'react'

export default function PayPalSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function runSetup() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/paypal/setup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Error')
      else setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px 32px', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 28, marginBottom: 8 }}>
        ⚙️ Setup PayPal
      </h1>
      <p style={{ color: 'var(--muted2)', fontSize: 14, marginBottom: 28 }}>
        Crea el producto y los 6 planes de suscripción en PayPal con un clic. Solo necesitas hacerlo una vez.
      </p>

      {!result && (
        <button onClick={runSetup} disabled={loading} className="btn-primary"
          style={{ fontSize: 15, padding: '14px 32px', opacity: loading ? .7 : 1 }}>
          {loading ? '⏳ Creando planes en PayPal...' : '🚀 Crear Producto y Planes'}
        </button>
      )}

      {error && (
        <div style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 12, padding: 16, marginTop: 20, color: 'var(--red)', fontSize: 13 }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{ background: 'rgba(0,207,136,0.1)', border: '1px solid rgba(0,207,136,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>✅ ¡Planes creados exitosamente!</div>
            <div style={{ fontSize: 13, color: 'var(--muted2)' }}>Copia las variables de abajo y agrégalas en Vercel → Environment Variables</div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              Variables para Vercel
            </div>
            <pre style={{ fontSize: 12, color: 'var(--green)', lineHeight: 1.8, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{result.env_vars}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(result.env_vars)}
              style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--muted2)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              📋 Copiar todo
            </button>
          </div>

          <div style={{ marginTop: 16, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>IDs creados</div>
            {Object.entries(result.data ?? {}).map(([k, v]: any) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--muted2)' }}>{k}</span>
                <span style={{ color: 'var(--purple2)', fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
