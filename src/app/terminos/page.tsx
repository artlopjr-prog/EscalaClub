import Link from 'next/link'
import { Zap } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple2: '#9F67FF' }

export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text }}>EscalaClub</span>
          </Link>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', marginBottom: 12 }}>Términos y Condiciones</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 48 }}>Última actualización: Mayo 2026 · Versión 1.0</p>

        {[
          {
            title: '1. Aceptación de los Términos',
            content: `Al acceder o utilizar EscalaClub ("la Plataforma"), operada por SCALON (Panamá), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, no debes usar la Plataforma. Estos términos aplican a todos los usuarios, incluyendo visitantes, miembros y creadores.`
          },
          {
            title: '2. Descripción del Servicio',
            content: `EscalaClub es una plataforma SaaS tipo marketplace que permite a creadores de contenido crear y gestionar comunidades online de pago, publicar cursos, organizar eventos en vivo y conectar con sus audiencias en Latinoamérica. Los miembros pueden unirse a comunidades, acceder a cursos y participar en eventos organizados por los creadores.`
          },
          {
            title: '3. Cuentas de Usuario',
            content: `3.1 Debes tener al menos 18 años para crear una cuenta.\n3.2 Eres responsable de mantener la confidencialidad de tu contraseña.\n3.3 Debes proporcionar información veraz y actualizada al registrarte.\n3.4 No puedes crear múltiples cuentas para eludir restricciones de la plataforma.\n3.5 EscalaClub se reserva el derecho de suspender o eliminar cuentas que violen estos términos.`
          },
          {
            title: '4. Planes y Pagos para Creadores',
            content: `4.1 Los creadores deben suscribirse a uno de los planes disponibles (Starter $39/mes, Creator $79/mes, Pro $129/mes) para activar su comunidad.\n4.2 Los pagos se procesan mediante PayPal. Al suscribirte, autorizas cargos recurrentes según el plan elegido.\n4.3 Los planes anuales ofrecen un descuento del 20% respecto al precio mensual.\n4.4 EscalaClub no reembolsa pagos ya procesados salvo por fallas técnicas comprobables del servicio.\n4.5 EscalaClub se reserva el derecho de modificar precios con 30 días de aviso previo.`
          },
          {
            title: '5. Membresías de Comunidades',
            content: `5.1 Los creadores determinan libremente el precio de acceso a sus comunidades.\n5.2 Los pagos de membresía van directamente al PayPal del creador. EscalaClub no retiene comisiones sobre estos pagos.\n5.3 Los creadores son responsables de cumplir con sus obligaciones fiscales sobre los ingresos recibidos.\n5.4 EscalaClub no es parte en las transacciones entre creadores y miembros, y no asume responsabilidad por disputas entre ellos.\n5.5 Las políticas de reembolso de membresías las establece cada creador individualmente.`
          },
          {
            title: '6. Contenido del Usuario',
            content: `6.1 Eres el único responsable del contenido que publicas en la plataforma.\n6.2 Al publicar contenido, otorgas a EscalaClub una licencia no exclusiva para mostrarlo dentro de la plataforma.\n6.3 Está prohibido publicar contenido ilegal, ofensivo, que infrinja derechos de terceros, spam, material adulto explícito, o contenido que incite a la violencia o discriminación.\n6.4 EscalaClub puede eliminar contenido que viole estas normas sin previo aviso.\n6.5 Los creadores son responsables del contenido publicado en sus comunidades.`
          },
          {
            title: '7. Propiedad Intelectual',
            content: `7.1 EscalaClub y sus logos, diseño y código son propiedad de SCALON. No puedes reproducirlos sin autorización.\n7.2 Los creadores conservan todos los derechos sobre su contenido original.\n7.3 No puedes copiar, distribuir o vender cursos o contenido de las comunidades sin autorización expresa del creador.`
          },
          {
            title: '8. Limitación de Responsabilidad',
            content: `8.1 EscalaClub se provee "tal cual" sin garantías de ningún tipo.\n8.2 EscalaClub no garantiza disponibilidad ininterrumpida del servicio.\n8.3 En ningún caso EscalaClub será responsable por daños indirectos, pérdida de ingresos o datos resultantes del uso de la plataforma.\n8.4 La responsabilidad máxima de EscalaClub se limita al monto pagado por el usuario en los últimos 3 meses.`
          },
          {
            title: '9. Privacidad',
            content: `El uso de la plataforma está sujeto a nuestra Política de Privacidad, disponible en escala-club.vercel.app/privacidad. Al usar EscalaClub, aceptas las prácticas de recopilación y uso de datos descritas en dicha política.`
          },
          {
            title: '10. Terminación',
            content: `10.1 Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil.\n10.2 EscalaClub puede suspender o terminar tu acceso si violas estos términos.\n10.3 Al cancelar una suscripción de creador, tu comunidad permanecerá activa hasta el fin del período pagado.\n10.4 Tras la cancelación, el contenido puede ser eliminado de los servidores después de 30 días.`
          },
          {
            title: '11. Ley Aplicable',
            content: `Estos Términos se rigen por las leyes de la República de Panamá. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de Ciudad de Panamá.`
          },
          {
            title: '12. Cambios a los Términos',
            content: `EscalaClub puede modificar estos Términos en cualquier momento. Te notificaremos por email con al menos 15 días de anticipación. El uso continuado de la plataforma después de los cambios constituye aceptación de los nuevos términos.`
          },
          {
            title: '13. Contacto',
            content: `Para preguntas sobre estos Términos, contáctanos en: hola@escalaclub.com`
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 12, color: C.text }}>{section.title}</h2>
            <div style={{ fontSize: 15, color: C.muted2, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.content}</div>
          </div>
        ))}

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/privacidad" style={{ color: C.purple2, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>→ Política de Privacidad</Link>
          <Link href="/registro" style={{ color: C.purple2, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Crear cuenta →</Link>
        </div>
      </div>
    </div>
  )
}
