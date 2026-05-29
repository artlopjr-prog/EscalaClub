'use client'

import { useRef } from 'react'
import { Download, Award, ExternalLink } from 'lucide-react'
import { KomunioLogo } from '@/components/KomunioLogo'
import Link from 'next/link'

interface Certificate {
  id: string
  certificate_number: string
  issued_at: string
  course: {
    id: string
    title: string
    emoji: string
    description: string
    instructor: { display_name: string } | null
  } | null
  community: {
    name: string
    logo_url: string | null
    primary_color: string | null
  } | null
}

interface Props {
  certificates: Certificate[]
  userName: string
}

export default function CertificadosClient({ certificates, userName }: Props) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,32px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,4vw,30px)', letterSpacing: '-0.03em', marginBottom: 6 }}>
          🎓 Mis certificados
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {certificates.length === 0
            ? 'Completa cursos para obtener tus certificados'
            : `${certificates.length} certificado${certificates.length !== 1 ? 's' : ''} obtenido${certificates.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Empty state */}
      {certificates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎓</div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            Aún no tienes certificados
          </h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
            Completa el 100% de las lecciones de cualquier curso para obtener tu certificado.
          </p>
          <Link href="/cursos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, background: 'var(--purple)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            Ver cursos disponibles →
          </Link>
        </div>
      )}

      {/* Certificates grid */}
      {certificates.length > 0 && (
        <div style={{ display: 'grid', gap: 20 }}>
          {certificates.map(cert => (
            <CertificateCard key={cert.id} cert={cert} userName={userName} />
          ))}
        </div>
      )}
    </div>
  )
}

function CertificateCard({ cert, userName }: { cert: Certificate; userName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accent = cert.community?.primary_color ?? '#6C47FF'
  const issueDate = new Date(cert.issued_at).toLocaleDateString('es', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  function downloadCertificate() {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 848
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 1200, 848)

    // Top accent bar
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, 1200, 8)

    // Border
    ctx.strokeStyle = accent + '22'
    ctx.lineWidth = 2
    ctx.strokeRect(24, 24, 1152, 800)

    // Inner border
    ctx.strokeStyle = accent + '15'
    ctx.lineWidth = 1
    ctx.strokeRect(36, 36, 1128, 776)

    // Decorative corners
    const corners = [[40, 40], [1160, 40], [40, 808], [1160, 808]] as const
    corners.forEach(([x, y]) => {
      ctx.fillStyle = accent + '20'
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
    })

    // "CERTIFICADO DE FINALIZACIÓN"
    ctx.fillStyle = accent
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '3px'
    ctx.fillText('CERTIFICADO DE FINALIZACIÓN', 600, 110)

    // Decorative line
    ctx.strokeStyle = accent + '40'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 125)
    ctx.lineTo(1000, 125)
    ctx.stroke()

    // "Se certifica que"
    ctx.fillStyle = '#888888'
    ctx.font = 'italic 18px Georgia, serif'
    ctx.letterSpacing = '0px'
    ctx.fillText('Se certifica que', 600, 200)

    // User name — big
    ctx.fillStyle = '#1a1a2e'
    ctx.font = 'bold 58px Georgia, serif'
    ctx.fillText(userName, 600, 290)

    // Underline name
    const nameWidth = ctx.measureText(userName).width
    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(600 - nameWidth / 2, 305)
    ctx.lineTo(600 + nameWidth / 2, 305)
    ctx.stroke()

    // "ha completado satisfactoriamente el curso"
    ctx.fillStyle = '#555555'
    ctx.font = '18px Arial'
    ctx.fillText('ha completado satisfactoriamente el curso', 600, 370)

    // Course title
    ctx.fillStyle = '#1a1a2e'
    ctx.font = 'bold 32px Arial'
    const courseTitle = `${cert.course?.emoji ?? '📚'} ${cert.course?.title ?? 'Curso'}`
    ctx.fillText(courseTitle, 600, 440)

    // Community name
    if (cert.community?.name) {
      ctx.fillStyle = '#888888'
      ctx.font = '16px Arial'
      ctx.fillText(`impartido por ${cert.community.name}`, 600, 490)
    }

    // Instructor
    if (cert.course?.instructor?.display_name) {
      ctx.fillStyle = '#777777'
      ctx.font = '15px Arial'
      ctx.fillText(`Instructor: ${cert.course.instructor.display_name}`, 600, 524)
    }

    // Divider
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(150, 570)
    ctx.lineTo(1050, 570)
    ctx.stroke()

    // Date + Certificate number
    ctx.fillStyle = '#999999'
    ctx.font = '13px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Emitido el ${issueDate}`, 160, 610)

    ctx.textAlign = 'right'
    ctx.fillText(`Nº ${cert.certificate_number}`, 1040, 610)

    // Komunio branding at bottom
    ctx.textAlign = 'center'
    ctx.fillStyle = accent
    ctx.font = 'bold 18px Arial'
    ctx.fillText('Komunio', 600, 680)
    ctx.fillStyle = '#AAAAAA'
    ctx.font = '12px Arial'
    ctx.fillText('La plataforma de comunidades de LATAM · komunio.vercel.app', 600, 700)

    // Download
    const link = document.createElement('a')
    link.download = `certificado-${cert.course?.title ?? 'curso'}-${userName}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  return (
    <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>

      {/* Certificate preview */}
      <div style={{ background: `linear-gradient(135deg, ${accent}10, ${accent}05)`, borderBottom: `3px solid ${accent}`, padding: '28px 28px 20px', position: 'relative' }}>

        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: accent + '20', marginBottom: 12 }}>
            <Award size={26} color={accent} />
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Certificado de Finalización
          </p>

          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Se certifica que</p>

          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(18px,3vw,26px)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 10 }}>
            {userName}
          </h2>

          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>ha completado el curso</p>

          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 'clamp(15px,2.5vw,20px)', color: 'var(--text)', marginBottom: 4 }}>
            {cert.course?.emoji} {cert.course?.title}
          </h3>

          {cert.community?.name && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>en {cert.community.name}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>
            Emitido el {issueDate}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', fontFamily: 'monospace' }}>
            {cert.certificate_number}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/cursos/${cert.course?.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border2)', background: 'var(--bg)', color: 'var(--muted2)', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>
            <ExternalLink size={12} /> Ver curso
          </Link>
          <button
            onClick={downloadCertificate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: accent, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            <Download size={13} /> Descargar PNG
          </button>
        </div>
      </div>
    </div>
  )
}
