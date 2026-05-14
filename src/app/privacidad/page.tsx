import Link from 'next/link'
import { Zap } from 'lucide-react'

const C = { bg: '#06060A', bg1: '#0D0D14', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple2: '#9F67FF' }

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #9F67FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text }}>EscalaClub</span>
          </Link>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.04em', marginBottom: 12 }}>Política de Privacidad</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 48 }}>Última actualización: Mayo 2026 · Versión 1.0</p>

        {[
          {
            title: '1. Información que Recopilamos',
            content: `Recopilamos la siguiente información:\n\n• Información de registro: nombre, email, país e idioma.\n• Información de perfil: foto, biografía, redes sociales (opcional).\n• Información de pago: procesada por PayPal; EscalaClub no almacena datos de tarjetas.\n• Datos de uso: páginas visitadas, cursos completados, interacciones en el foro.\n• Información técnica: dirección IP, tipo de navegador, dispositivo.`
          },
          {
            title: '2. Cómo Usamos tu Información',
            content: `Utilizamos tu información para:\n\n• Proveer y mejorar el servicio de EscalaClub.\n• Procesar pagos y gestionar suscripciones.\n• Enviarte notificaciones sobre tu cuenta y actividad en la plataforma.\n• Enviar comunicaciones de marketing (puedes cancelar en cualquier momento).\n• Cumplir obligaciones legales.\n• Prevenir fraude y garantizar la seguridad de la plataforma.`
          },
          {
            title: '3. Compartición de Información',
            content: `No vendemos tu información personal. La compartimos únicamente con:\n\n• Proveedores de servicios: Supabase (base de datos), Vercel (hosting), PayPal (pagos), Resend (emails). Estos proveedores están sujetos a acuerdos de confidencialidad.\n• Creadores de comunidades: pueden ver tu nombre y foto de perfil como miembro de su comunidad.\n• Autoridades legales: cuando sea requerido por ley o para proteger derechos legítimos.`
          },
          {
            title: '4. Cookies y Tecnologías Similares',
            content: `Usamos cookies esenciales para el funcionamiento de la plataforma (autenticación, preferencias). No usamos cookies de rastreo de terceros con fines publicitarios. Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad del servicio.`
          },
          {
            title: '5. Seguridad de los Datos',
            content: `Implementamos medidas de seguridad estándar de la industria:\n\n• Cifrado SSL/TLS para todas las comunicaciones.\n• Contraseñas almacenadas con hash seguro (bcrypt).\n• Acceso a datos restringido con Row Level Security (RLS) en base de datos.\n• Infraestructura alojada en servidores seguros de Supabase y Vercel.`
          },
          {
            title: '6. Tus Derechos',
            content: `Tienes derecho a:\n\n• Acceder a los datos personales que tenemos sobre ti.\n• Corregir información incorrecta o incompleta.\n• Solicitar la eliminación de tu cuenta y datos asociados.\n• Exportar tu información en formato legible.\n• Oponerte al procesamiento de tus datos para marketing.\n\nPara ejercer estos derechos, escríbenos a: hola@escalaclub.com`
          },
          {
            title: '7. Retención de Datos',
            content: `Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, tus datos personales se borran en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales.`
          },
          {
            title: '8. Menores de Edad',
            content: `EscalaClub no está dirigido a personas menores de 18 años. Si eres menor de 18 años, no debes registrarte ni usar la plataforma. Si detectamos que un usuario es menor de edad, eliminaremos su cuenta inmediatamente.`
          },
          {
            title: '9. Transferencias Internacionales',
            content: `Tu información puede ser procesada en servidores ubicados fuera de tu país de residencia. Al usar EscalaClub, consientes estas transferencias. Nos aseguramos de que nuestros proveedores cumplan con estándares adecuados de protección de datos.`
          },
          {
            title: '10. Cambios a esta Política',
            content: `Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos por email sobre cambios significativos. El uso continuado de EscalaClub después de los cambios constituye tu aceptación.`
          },
          {
            title: '11. Contacto',
            content: `Para consultas sobre privacidad o ejercer tus derechos:\n\nEmail: hola@escalaclub.com\nEmpresa: SCALON\nPaís: República de Panamá`
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 12, color: C.text }}>{section.title}</h2>
            <div style={{ fontSize: 15, color: C.muted2, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.content}</div>
          </div>
        ))}

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/terminos" style={{ color: C.purple2, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>→ Términos y Condiciones</Link>
          <Link href="/registro" style={{ color: C.purple2, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Crear cuenta →</Link>
        </div>
      </div>
    </div>
  )
}
