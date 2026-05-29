import Link from 'next/link'
import { KomunioLogo } from '@/components/KomunioLogo'

export const metadata = { title: 'Política de Privacidad · Komunio' }

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <nav style={{ borderBottom: '1px solid #F0F0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><KomunioLogo size={28} variant="full" theme="light" /></Link>
        <Link href="/" style={{ fontSize: 13, color: '#737373', textDecoration: 'none' }}>← Volver al inicio</Link>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 8 }}>Política de Privacidad</h1>
        <p style={{ fontSize: 14, color: '#737373', marginBottom: 40 }}>Última actualización: Mayo 2026</p>

        {[
          { title: '1. Información que recopilamos', body: 'Recopilamos información que usted nos proporciona al crear una cuenta (nombre, email, país), información de uso de la plataforma (posts, interacciones, progreso en cursos), información de pagos procesada a través de PayPal (no almacenamos datos de tarjetas), y datos técnicos como dirección IP y tipo de navegador para mejorar el servicio.' },
          { title: '2. Cómo usamos su información', body: 'Usamos su información para proporcionar y mejorar nuestros servicios, procesar pagos y enviar confirmaciones, enviar comunicaciones sobre su cuenta y la plataforma, personalizar su experiencia, y cumplir con obligaciones legales. No vendemos su información personal a terceros.' },
          { title: '3. Compartición de datos', body: 'Compartimos información con proveedores de servicios necesarios para operar la plataforma (Supabase para base de datos, PayPal para pagos, Resend para emails). Los creadores de comunidades pueden ver la información de perfil de sus miembros. No compartimos datos con terceros para publicidad.' },
          { title: '4. Cookies y tecnologías similares', body: 'Usamos cookies estrictamente necesarias para el funcionamiento de la sesión. No usamos cookies de rastreo publicitario. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la plataforma.' },
          { title: '5. Seguridad de datos', body: 'Implementamos medidas técnicas y organizativas para proteger su información: conexiones cifradas SSL/TLS, bases de datos con acceso controlado mediante Row Level Security, contraseñas cifradas mediante bcrypt. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar seguridad absoluta.' },
          { title: '6. Retención de datos', body: 'Conservamos su información mientras su cuenta esté activa. Al cerrar su cuenta, eliminamos sus datos personales en un plazo de 30 días, excepto cuando la ley exija conservarlos por más tiempo (por ejemplo, registros de transacciones financieras).' },
          { title: '7. Sus derechos', body: 'Tiene derecho a acceder a sus datos personales, solicitar corrección de datos incorrectos, solicitar eliminación de su cuenta y datos, oponerse al procesamiento de sus datos, y recibir sus datos en formato portable. Para ejercer estos derechos, contacte: hola@komunio.app' },
          { title: '8. Transferencias internacionales', body: 'Sus datos pueden ser procesados en servidores ubicados en Estados Unidos (Supabase, Vercel). Estas transferencias se realizan con las garantías adecuadas conforme a la legislación de protección de datos aplicable.' },
          { title: '9. Menores de edad', body: 'Komunio no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. Si detectamos que un menor ha creado una cuenta, la eliminaremos de inmediato.' },
          { title: '10. Cambios a esta política', body: 'Podemos actualizar esta política periódicamente. Le notificaremos cambios significativos por email. El uso continuado de la plataforma después de los cambios implica aceptación de la nueva política.' },
          { title: '11. Contacto', body: 'Para consultas sobre privacidad y protección de datos: hola@komunio.app · komunio.vercel.app' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#0F0F0F' }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.75 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
