let Resend: any
try { Resend = require('resend').Resend } catch {}

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  if (!Resend) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM   = process.env.EMAIL_FROM ?? 'EscalaClub <hola@escalaclub.com>'
const BASE   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://escala-club.vercel.app'
const PURPLE = '#7B5EF8'
const PURPLE2= '#A78BFF'
const GOLD   = '#E9A020'
const GREEN  = '#00CF88'
const BG     = 'var(--bg)'
const BG2    = 'var(--bg2)'
const TEXT   = 'var(--text)'
const MUTED  = 'var(--muted2)'

// ── WRAPPER BASE ──
function wrap(content: string, preheader = '') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>EscalaClub</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Outfit',system-ui,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;">

  <!-- LOGO -->
  <tr><td style="padding:0 0 20px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:8px;">
      <div style="background:linear-gradient(135deg,${PURPLE},${PURPLE2});width:36px;height:36px;border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:18px;">⚡</div>
      <span style="font-size:20px;font-weight:900;color:${TEXT};letter-spacing:-0.04em;">EscalaClub</span>
    </div>
  </td></tr>

  <!-- CONTENT -->
  <tr><td style="background:${BG2};border-radius:20px;border:1px solid var(--border);overflow:hidden;">
    ${content}
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:20px 0;text-align:center;">
    <p style="font-size:11px;color:var(--muted);margin:0 0 4px;">EscalaClub · La plataforma de comunidades de LATAM</p>
    <p style="font-size:11px;color:var(--muted);margin:0;">
      <a href="${BASE}/notificaciones" style="color:var(--muted);">Gestionar notificaciones</a> · 
      <a href="${BASE}" style="color:var(--muted);">Ir a la plataforma</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── HERO SECTION ──
function hero(emoji: string, title: string, subtitle: string, gradFrom = PURPLE, gradTo = PURPLE2) {
  return `<div style="background:linear-gradient(135deg,${gradFrom},${gradTo});padding:32px;text-align:center;">
    <div style="font-size:40px;margin-bottom:10px;">${emoji}</div>
    <h1 style="font-size:22px;font-weight:900;color:#fff;margin:0 0 8px;letter-spacing:-0.03em;">${title}</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0;">${subtitle}</p>
  </div>`
}

// ── BUTTON ──
function btn(text: string, url: string, color = PURPLE) {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0 0;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${color},${color}CC);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:-0.01em;">${text}</a>
  </td></tr></table>`
}

// ── BODY PADDING ──
function body(content: string) {
  return `<div style="padding:28px 28px 24px;">${content}</div>`
}

// ── STAT CARD ──
function stat(emoji: string, label: string, value: string, color = PURPLE2) {
  return `<td style="width:33%;text-align:center;padding:14px 8px;background:var(--bg1);border-radius:10px;">
    <div style="font-size:22px;margin-bottom:4px;">${emoji}</div>
    <div style="font-size:18px;font-weight:900;color:${color};margin-bottom:2px;">${value}</div>
    <div style="font-size:11px;color:${MUTED};">${label}</div>
  </td>`
}

// ══════════════════════════════════════
// EMAILS
// ══════════════════════════════════════

// 1. BIENVENIDA
export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const first = name.split(' ')[0]
  return resend.emails.send({
    from: FROM, to: email,
    subject: `¡Bienvenido a EscalaClub, ${first}! 🚀`,
    html: wrap(
      hero('👋', `¡Hola ${first}, bienvenido!`, 'Ya eres parte de la mejor plataforma de comunidades de LATAM') +
      body(`
        <p style="font-size:15px;color:${MUTED};line-height:1.7;margin:0 0 20px;">Tu cuenta está lista. Esto es lo que puedes hacer desde hoy:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          ${[
            ['🌐','Únete a comunidades','Conecta con miles de emprendedores de LATAM'],
            ['⚡','Acepta retos','Construye hábitos y compite en el leaderboard global'],
            ['🎮','Juega y gana XP','Spin diario, trivia y más — gana badges exclusivos'],
            ['🤖','Tutor IA','Pregunta lo que quieras a tu asistente de comunidad'],
          ].map(([e,t,d]) => `<tr>
            <td style="padding:10px;background:var(--bg1);border-radius:10px;margin-bottom:8px;">
              <span style="font-size:18px;">${e}</span>
              <strong style="color:${TEXT};font-size:13px;margin-left:8px;">${t}</strong>
              <span style="color:${MUTED};font-size:12px;"> — ${d}</span>
            </td></tr><tr><td style="height:6px;"></td></tr>`).join('')}
        </table>
        ${btn('Explorar comunidades →', `${BASE}/comunidades`)}
      `),
      `Bienvenido ${first} — tu cuenta en EscalaClub está lista`
    )
  })
}

// 2. UNIRSE A COMUNIDAD
export async function sendJoinCommunityEmail(email: string, name: string, communityName: string, communitySlug: string, memberCount?: number) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const first = name.split(' ')[0]
  return resend.emails.send({
    from: FROM, to: email,
    subject: `¡Ya eres parte de ${communityName}! 🎊`,
    html: wrap(
      hero('🎊', `¡Bienvenido a ${communityName}!`, `Hola ${first}, ya tienes acceso a todo el contenido exclusivo`) +
      body(`
        <p style="font-size:15px;color:${MUTED};line-height:1.7;margin:0 0 20px;">
          Ahora formas parte de una comunidad de <strong style="color:${TEXT};">${memberCount ? memberCount.toLocaleString() : 'cientos de'} miembros</strong> comprometidos con crecer.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            ${stat('💬','Posts del foro','Acceso total',PURPLE2)}
            <td style="width:8px;"></td>
            ${stat('⚡','Retos','Participa ya',GOLD)}
            <td style="width:8px;"></td>
            ${stat('🤖','Tutor IA','Disponible',GREEN)}
          </tr>
        </table>
        ${btn('Ir al foro →', `${BASE}/comunidades/${communitySlug}/foro`)}
      `)
    )
  })
}

// 3. NUEVO MIEMBRO (al creador)
export async function sendNewMemberEmail(creatorEmail: string, communityName: string, memberName: string, totalMembers: number) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  return resend.emails.send({
    from: FROM, to: creatorEmail,
    subject: `Nuevo miembro en ${communityName}: ${memberName} 🎉`,
    html: wrap(
      hero('👥', '¡Nuevo miembro!', `${memberName} acaba de unirse a ${communityName}`, '#00A06B', GREEN) +
      body(`
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            ${stat('👥','Total miembros',totalMembers.toLocaleString(),GREEN)}
            <td style="width:8px;"></td>
            ${stat('📈','Crecimiento','Hoy +1',PURPLE2)}
            <td style="width:8px;"></td>
            ${stat('💰','MRR','En aumento',GOLD)}
          </tr>
        </table>
        ${btn('Ver miembros →', `${BASE}/creator/miembros`)}
      `)
    )
  })
}

// 4. PAGO CONFIRMADO (miembro)
export async function sendPaymentConfirmedEmail(email: string, name: string, communityName: string, amount: number, communitySlug: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const first = name.split(' ')[0]
  return resend.emails.send({
    from: FROM, to: email,
    subject: `Pago confirmado — ${communityName} ✓`,
    html: wrap(
      hero('✅', '¡Pago confirmado!', `Tu membresía en ${communityName} está activa`, '#00A06B', GREEN) +
      body(`
        <p style="font-size:15px;color:${MUTED};line-height:1.7;margin:0 0 20px;">Hola ${first}, tu pago de <strong style="color:${GREEN};">$${amount.toFixed(2)} USD</strong> fue procesado exitosamente.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,207,136,0.06);border:1px solid rgba(0,207,136,0.15);border-radius:14px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Resumen</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:13px;color:${TEXT};">Comunidad</span>
              <strong style="font-size:13px;color:${PURPLE2};">${communityName}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:13px;color:${TEXT};">Monto</span>
              <strong style="font-size:13px;color:${GREEN};">$${amount.toFixed(2)} USD</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:13px;color:${TEXT};">Estado</span>
              <strong style="font-size:13px;color:${GREEN};">✓ Confirmado</strong>
            </div>
          </td></tr>
        </table>
        ${btn('Ir a mi comunidad →', `${BASE}/comunidades/${communitySlug}/foro`)}
      `)
    )
  })
}

// 5. RETO COMPLETADO
export async function sendChallengeCompleteEmail(email: string, name: string, challengeName: string, totalDays: number, badgeEmoji: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const first = name.split(' ')[0]
  return resend.emails.send({
    from: FROM, to: email,
    subject: `¡Completaste el reto "${challengeName}"! 🏆`,
    html: wrap(
      hero('🏆', '¡Reto completado!', `${totalDays} días sin fallar — eres increíble, ${first}`, '#B07A00', GOLD) +
      body(`
        <p style="font-size:15px;color:${MUTED};line-height:1.7;margin:0 0 20px;">
          Completaste <strong style="color:${TEXT};">${challengeName}</strong> con <strong style="color:${GOLD};">🔥 ${totalDays} días consecutivos</strong>. Eso requiere disciplina real.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(233,160,32,0.08);border:1px solid rgba(233,160,32,0.2);border-radius:14px;text-align:center;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <div style="font-size:48px;margin-bottom:8px;">${badgeEmoji}</div>
            <div style="font-size:16px;font-weight:700;color:${GOLD};margin-bottom:4px;">Badge desbloqueado</div>
            <div style="font-size:12px;color:${MUTED};">Aparece permanentemente en tu perfil</div>
          </td></tr>
        </table>
        ${btn('Ver mis badges →', `${BASE}/badges`, GOLD)}
      `)
    )
  })
}

// 6. NUEVO BADGE
export async function sendNewBadgeEmail(email: string, name: string, badgeName: string, badgeEmoji: string, badgeDesc: string, rarity: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const first = name.split(' ')[0]
  const rarityColors: Record<string,string> = { common: 'var(--muted2)', rare: '#3B8EF5', epic: PURPLE2, legendary: GOLD }
  const color = rarityColors[rarity] ?? PURPLE2
  return resend.emails.send({
    from: FROM, to: email,
    subject: `¡Nuevo badge: ${badgeName}! ${badgeEmoji}`,
    html: wrap(
      hero(badgeEmoji, '¡Nuevo badge desbloqueado!', `${first}, acabas de conseguir algo especial`, PURPLE, PURPLE2) +
      body(`
        <table width="100%" cellpadding="0" cellspacing="0" style="background:var(--bg1);border:1px solid var(--border);border-radius:14px;text-align:center;margin-bottom:20px;">
          <tr><td style="padding:24px;">
            <div style="font-size:52px;margin-bottom:12px;">${badgeEmoji}</div>
            <div style="font-size:18px;font-weight:900;color:${TEXT};margin-bottom:6px;">${badgeName}</div>
            <div style="font-size:12px;color:${MUTED};margin-bottom:10px;">${badgeDesc}</div>
            <div style="display:inline-block;padding:3px 12px;background:${color}22;border:1px solid ${color}44;border-radius:99px;font-size:11px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.08em;">${rarity}</div>
          </td></tr>
        </table>
        ${btn('Ver todos mis badges →', `${BASE}/badges`)}
      `)
    )
  })
}

// 7. RECORDATORIO DE RETO
export async function sendChallengeReminderEmail(email: string, name: string, challengeName: string, dayNum: number, streak: number) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const first = name.split(' ')[0]
  return resend.emails.send({
    from: FROM, to: email,
    subject: `⚡ ${first}, ¿ya marcaste tu día ${dayNum} en "${challengeName}"?`,
    html: wrap(
      hero('🔥', '¡No rompas la racha!', `Día ${dayNum} de tu reto te está esperando`, '#B05000', '#FF6B35') +
      body(`
        <p style="font-size:15px;color:${MUTED};line-height:1.7;margin:0 0 20px;">
          Hola ${first}, aún no has marcado el día ${dayNum} de <strong style="color:${TEXT};">${challengeName}</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:14px;text-align:center;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <div style="font-size:44px;margin-bottom:8px;">🔥</div>
            <div style="font-size:28px;font-weight:900;color:#FF6B35;margin-bottom:4px;">${streak} días</div>
            <div style="font-size:13px;color:${MUTED};">de racha activa — no la pierdas hoy</div>
          </td></tr>
        </table>
        ${btn('Marcar día ' + dayNum + ' →', `${BASE}/retos`, '#FF6B35')}
      `)
    )
  })
}

// 8. RECUPERAR CONTRASEÑA (override de Supabase)
export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  return resend.emails.send({
    from: FROM, to: email,
    subject: 'Recupera tu contraseña en EscalaClub 🔐',
    html: wrap(
      hero('🔐', 'Recuperar contraseña', 'Haz clic abajo para crear una nueva contraseña') +
      body(`
        <p style="font-size:15px;color:${MUTED};line-height:1.7;margin:0 0 20px;">
          ${name ? `Hola ${name.split(' ')[0]}, r` : 'R'}ecibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, ignora este email.
        </p>
        <p style="font-size:12px;color:${MUTED};margin:0 0 4px;">Este link expira en 1 hora.</p>
        ${btn('Crear nueva contraseña →', resetUrl)}
      `)
    )
  })
}

// 9. INGRESO DEL CREADOR (cuando recibe un pago)
export async function sendCreatorPaymentEmail(creatorEmail: string, creatorName: string, memberName: string, communityName: string, amount: number, platformFee: number) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const net = amount - platformFee
  return resend.emails.send({
    from: FROM, to: creatorEmail,
    subject: `💰 Nuevo ingreso: $${amount.toFixed(2)} USD de ${memberName}`,
    html: wrap(
      hero('💰', '¡Nuevo ingreso!', `${memberName} pagó su membresía en ${communityName}`, '#8C6200', GOLD) +
      body(`
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(233,160,32,0.06);border:1px solid rgba(233,160,32,0.15);border-radius:14px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:13px;color:${MUTED};">Ingreso bruto</span>
              <strong style="color:${TEXT};">$${amount.toFixed(2)} USD</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:13px;color:${MUTED};">Fee EscalaClub (1.5%)</span>
              <span style="color:${MUTED};">−$${platformFee.toFixed(2)} USD</span>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:8px;display:flex;justify-content:space-between;">
              <strong style="font-size:14px;color:${TEXT};">Tu ingreso neto</strong>
              <strong style="font-size:16px;color:${GOLD};">$${net.toFixed(2)} USD</strong>
            </div>
          </td></tr>
        </table>
        ${btn('Ver mis ingresos →', `${BASE}/creator/ingresos`, GOLD)}
      `)
    )
  })
}
