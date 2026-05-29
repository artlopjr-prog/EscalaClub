'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, Users, MousePointer, DollarSign, TrendingUp } from 'lucide-react'

const BASE_URL = 'https://komunio.vercel.app'
const COMMISSION_PCT = 20

export default function AfiliadosPage() {
  const supabase = createClient()
  const [code, setCode] = useState<string | null>(null)
  const [clicks, setClicks] = useState(0)
  const [conversions, setConversions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/affiliates/code')
      const { code: c } = await res.json()
      setCode(c)
      if (!c) { setLoading(false); return }

      const [{ count: clickCount }, { data: convs }] = await Promise.all([
        supabase.from('ec_affiliate_clicks').select('*', { count: 'exact', head: true }).eq('code', c),
        supabase.from('ec_affiliate_conversions').select('*').eq('affiliate_code', c).order('created_at', { ascending: false }),
      ])
      setClicks(clickCount ?? 0)
      setConversions(convs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const affiliateUrl = code ? `${BASE_URL}?ref=${code}` : ''
  const totalEarned = conversions.reduce((sum, c) => sum + (c.commission_usd ?? 0), 0)
  const pendingEarned = conversions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.commission_usd ?? 0), 0)
  const conversionRate = clicks > 0 ? ((conversions.length / clicks) * 100).toFixed(1) : '0'

  function copyLink() {
    navigator.clipboard.writeText(affiliateUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,32px)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,4vw,30px)', letterSpacing: '-0.03em', marginBottom: 6 }}>
          📈 Programa de afiliados
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Gana el <strong>{COMMISSION_PCT}%</strong> de comisión por cada creador que se suscriba con tu link
        </p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(108,71,255,0.06), rgba(108,71,255,0.02))', border: '1px solid rgba(108,71,255,0.15)', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>¿Cómo funciona?</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { n: '1', t: 'Comparte tu link', d: 'Con tu audiencia en redes, email o blog' },
            { n: '2', t: 'Alguien se registra', d: 'Con tu link y se suscribe como creador' },
            { n: '3', t: 'Ganas el 20%', d: 'Del primer pago mensual de cada referido' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Tu link de afiliado</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--muted2)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {loading ? 'Generando...' : affiliateUrl}
          </div>
          <button onClick={copyLink} disabled={!code} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: copied ? 'var(--green)' : 'var(--purple)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0, transition: 'all .2s' }}>
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
          Tu código: <strong style={{ fontFamily: 'monospace', color: 'var(--purple)' }}>{code ?? '...'}</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Clics totales', value: clicks.toLocaleString(), color: '#3B82F6', emoji: '👆' },
          { label: 'Conversiones', value: conversions.length, color: '#10B981', emoji: '🎯' },
          { label: 'Tasa de conversión', value: `${conversionRate}%`, color: '#8B5CF6', emoji: '📊' },
          { label: 'Comisiones ganadas', value: `$${totalEarned.toFixed(2)}`, color: '#F59E0B', emoji: '💰' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em', color: s.color }}>{loading ? '...' : s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {pendingEarned > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>💰 Pago pendiente</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Se procesará en el próximo ciclo de pagos</div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 22, color: '#F59E0B' }}>${pendingEarned.toFixed(2)}</div>
        </div>
      )}

      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>Referidos registrados</h2>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{conversions.length} total</span>
        </div>
        {conversions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔗</div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Aún no tienes referidos. ¡Comparte tu link!</p>
          </div>
        ) : (
          <div>
            {conversions.map((c, i) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px', padding: '12px 20px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  Referido #{i + 1}
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                    {new Date(c.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted2)' }}>{c.plan ?? '—'}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>${(c.commission_usd ?? 0).toFixed(2)}</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: c.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: c.status === 'paid' ? 'var(--green)' : '#F59E0B' }}>
                  {c.status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Comisiones por plan (20%)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ plan: 'Starter', price: 39, commission: 7.80 }, { plan: 'Creator', price: 79, commission: 15.80 }, { plan: 'Pro', price: 129, commission: 25.80 }].map(p => (
            <div key={p.plan} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 10 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.plan}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>${p.price}/mes</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>+${p.commission.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>por referido</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
