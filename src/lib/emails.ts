let Resend: any
try { Resend = require('resend').Resend } catch {}

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  if (!Resend) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.EMAIL_FROM ?? 'EscalaClub <onboarding@resend.dev>'

function emailWrapper(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#06060A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06060A;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#0D0D14;border-radius:20px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7C3AED,#9F67FF);padding:28px 32px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">⚡</div>
          <div style="font-weight:900;font-size:22px;color:#fff;">EscalaClub</div>
        </td></tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;">
          <p style="font-size:12px;color:#6B6A80;margin:0;">EscalaClub · La plataforma de comunidades de LATAM</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const content = `
    <h1 style="font-size:26px;font-weight:900;color:#EEEDF5;margin:0 0 12px;">¡Bienvenido a EscalaClub, ${name.split(' ')[0]}! 🎉</h1>
    <p style="font-size:15px;color:#9998B0;line-height:1.7;margin:0 0 24px;">Tu cuenta está lista. Únete a la mejor plataforma de comunidades y cursos de LATAM.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="padding:12px;background:#13131C;border-radius:12px;"><span style="font-size:20px;">🌐</span> <strong style="color:#EEEDF5;">Únete a comunidades</strong> — Conecta con miles de emprendedores</td></tr>
      <tr><td style="height:8px;"></td></tr>
      <tr><td style="padding:12px;background:#13131C;border-radius:12px;"><span style="font-size:20px;">📚</span> <strong style="color:#EEEDF5;">Aprende con cursos</strong> — Contenido exclusivo de los mejores creadores</td></tr>
      <tr><td style="height:8px;"></td></tr>
      <tr><td style="padding:12px;background:#13131C;border-radius:12px;"><span style="font-size:20px;">🏆</span> <strong style="color:#EEEDF5;">Gana puntos</strong> — Sube en el leaderboard</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center"><a href="https://escala-club.vercel.app/comunidades" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7C3AED,#9F67FF);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">Explorar comunidades →</a></td></tr>
    </table>`
  return resend.emails.send({ from: FROM, to: email, subject: `¡Bienvenido a EscalaClub, ${name.split(' ')[0]}! 🚀`, html: emailWrapper(content) })
}

export async function sendJoinCommunityEmail(email: string, name: string, communityName: string, communitySlug: string) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const content = `
    <h1 style="font-size:24px;font-weight:900;color:#EEEDF5;margin:0 0 12px;">¡Ya eres parte de ${communityName}! 🎊</h1>
    <p style="font-size:15px;color:#9998B0;line-height:1.7;margin:0 0 24px;">Hola ${name.split(' ')[0]}, ya tienes acceso a todo el contenido exclusivo de <strong style="color:#9F67FF;">${communityName}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center"><a href="https://escala-club.vercel.app/comunidades/${communitySlug}/foro" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7C3AED,#9F67FF);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">Ir al foro →</a></td></tr>
    </table>`
  return resend.emails.send({ from: FROM, to: email, subject: `¡Bienvenido a ${communityName}! 🎊`, html: emailWrapper(content) })
}

export async function sendNewMemberEmail(creatorEmail: string, communityName: string, memberName: string, totalMembers: number) {
  const resend = getResend()
  if (!resend) return { skipped: true }
  const content = `
    <h1 style="font-size:24px;font-weight:900;color:#EEEDF5;margin:0 0 12px;">Nuevo miembro en ${communityName} 🎉</h1>
    <p style="font-size:15px;color:#9998B0;line-height:1.7;margin:0 0 24px;"><strong style="color:#9F67FF;">${memberName}</strong> acaba de unirse. Ahora tienes <strong style="color:#00D68F;">${totalMembers} miembros</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center"><a href="https://escala-club.vercel.app/creator/miembros" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7C3AED,#9F67FF);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">Ver miembros →</a></td></tr>
    </table>`
  return resend.emails.send({ from: FROM, to: creatorEmail, subject: `Nuevo miembro en ${communityName}: ${memberName}`, html: emailWrapper(content) })
}
