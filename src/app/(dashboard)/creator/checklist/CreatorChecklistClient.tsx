'use client'

import Link from 'next/link'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'

const STEPS = [
  {
    key: 'has_community',
    emoji: '🌐',
    title: 'Crea tu comunidad',
    desc: 'Dale un nombre y categoría a tu comunidad',
    action: 'Crear comunidad',
    href: '/creator/comunidad',
  },
  {
    key: 'has_logo',
    emoji: '🖼',
    title: 'Sube tu logo',
    desc: 'Una imagen cuadrada que represente tu marca',
    action: 'Subir logo',
    href: '/creator/comunidad',
  },
  {
    key: 'has_banner',
    emoji: '🎨',
    title: 'Agrega un banner',
    desc: 'La imagen de portada que verán los visitantes',
    action: 'Subir banner',
    href: '/creator/comunidad',
  },
  {
    key: 'has_description',
    emoji: '✍️',
    title: 'Escribe tu descripción',
    desc: 'Explica qué van a obtener tus miembros',
    action: 'Escribir descripción',
    href: '/creator/comunidad',
  },
  {
    key: 'has_video',
    emoji: '🎥',
    title: 'Agrega un video de presentación',
    desc: 'Un video de YouTube o Vimeo que presente tu comunidad',
    action: 'Agregar video',
    href: '/creator/comunidad',
  },
  {
    key: 'has_welcome',
    emoji: '👋',
    title: 'Escribe el mensaje de bienvenida',
    desc: 'Lo primero que verán tus nuevos miembros',
    action: 'Escribir bienvenida',
    href: '/creator/comunidad',
  },
  {
    key: 'has_price',
    emoji: '💰',
    title: 'Define el precio de membresía',
    desc: 'Decide cuánto cobrar mensualmente (o hazla gratis)',
    action: 'Configurar precio',
    href: '/creator/comunidad',
  },
  {
    key: 'has_social',
    emoji: '📱',
    title: 'Conecta tus redes sociales',
    desc: 'Instagram, TikTok, YouTube — para que te sigan',
    action: 'Agregar redes',
    href: '/creator/comunidad',
  },
  {
    key: 'has_course',
    emoji: '📚',
    title: 'Crea tu primer curso',
    desc: 'Contenido exclusivo para tus miembros de pago',
    action: 'Crear curso',
    href: '/creator/cursos/nuevo',
  },
  {
    key: 'has_event',
    emoji: '📅',
    title: 'Programa un evento en vivo',
    desc: 'Una sesión de preguntas, masterclass o llamada grupal',
    action: 'Crear evento',
    href: '/eventos',
  },
]

interface Props {
  profile: any
  community: any
  checklist: Record<string, boolean>
  completedCount: number
  totalCount: number
}

export default function CreatorChecklistClient({ profile, community, checklist, completedCount, totalCount }: Props) {
  const pct = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,28px)' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Panel Creador</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '-0.03em', marginBottom: 6 }}>
          {allDone ? '🎉 ¡Todo listo!' : `Configura tu comunidad`}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)' }}>
          {allDone
            ? 'Tu comunidad está 100% lista para recibir miembros.'
            : `${completedCount} de ${totalCount} pasos completados`}
        </p>
      </div>

      {/* PROGRESS */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>Progreso de configuración</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, color: pct === 100 ? 'var(--green)' : 'var(--purple)' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--purple), var(--purple2))', borderRadius: 99, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {community && (
            <Link href={`/comunidades/${community.slug}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--purple3)', color: 'var(--purple)', textDecoration: 'none', fontSize: 12, fontWeight: 600, border: '1px solid rgba(108,71,255,0.2)' }}>
              <ExternalLink size={12} /> Ver mi comunidad pública
            </Link>
          )}
        </div>
      </div>

      {/* CHECKLIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STEPS.map((step, i) => {
          const done = checklist[step.key]
          return (
            <div key={step.key} style={{
              background: done ? 'rgba(16,185,129,0.04)' : 'var(--bg1)',
              border: `1px solid ${done ? 'rgba(16,185,129,0.15)' : 'var(--border)'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: done ? 0.75 : 1,
            }}>
              {/* Check circle */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: done ? 'var(--green)' : 'var(--bg2)', border: `2px solid ${done ? 'var(--green)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {done ? <Check size={15} color="#fff" /> : <span style={{ fontSize: 13 }}>{step.emoji}</span>}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, marginBottom: 2, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--muted)' : 'var(--text)' }}>
                  {step.title}
                </div>
                {!done && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{step.desc}</div>}
              </div>

              {/* Action */}
              {!done && (
                <Link href={step.href}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: 'var(--purple)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {step.action} <ArrowRight size={12} />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* DONE STATE */}
      {allDone && (
        <div style={{ marginTop: 20, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '20px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🚀</div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>¡Tu comunidad está lista!</h3>
          <p style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 16 }}>Comparte el link con tu audiencia y empieza a crecer.</p>
          {community && (
            <Link href={`/comunidades/${community.slug}`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'var(--green)', color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>
              <ExternalLink size={15} /> Ver comunidad pública
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
