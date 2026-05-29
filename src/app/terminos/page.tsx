import Link from 'next/link'
import { KomunioLogo } from '@/components/KomunioLogo'

export const metadata = { title: 'Términos y Condiciones · Komunio' }

export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <nav style={{ borderBottom: '1px solid #F0F0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><KomunioLogo size={28} variant="full" theme="light" /></Link>
        <Link href="/" style={{ fontSize: 13, color: '#737373', textDecoration: 'none' }}>← Volver al inicio</Link>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 8 }}>Términos y Condiciones</h1>
        <p style={{ fontSize: 14, color: '#737373', marginBottom: 40 }}>Última actualización: Mayo 2026</p>

        {[
          { title: '1. Aceptación de los términos', body: 'Al acceder y usar Komunio ("la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder a la Plataforma. Komunio se reserva el derecho de actualizar estos términos en cualquier momento.' },
          { title: '2. Descripción del servicio', body: 'Komunio es una plataforma SaaS que permite a creadores de contenido crear comunidades online, publicar cursos y cobrar membresías a sus miembros. Komunio actúa únicamente como intermediario tecnológico entre creadores y miembros.' },
          { title: '3. Cuentas de usuario', body: 'Para usar Komunio debe crear una cuenta con información verídica. Es responsable de mantener la confidencialidad de su contraseña. Debe notificarnos inmediatamente si detecta uso no autorizado de su cuenta. Debe tener al menos 18 años para crear una cuenta.' },
          { title: '4. Creadores de contenido', body: 'Los creadores son responsables de todo el contenido que publican en sus comunidades. El contenido debe cumplir con las leyes aplicables y no puede ser ofensivo, ilegal o engañoso. Komunio puede eliminar contenido que viole estas políticas. Los creadores establecen sus propios precios y son responsables de sus obligaciones fiscales.' },
          { title: '5. Pagos y comisiones', body: 'Komunio cobra una comisión del 1.5% sobre cada transacción procesada a través de la plataforma, además de los planes de suscripción mensual o anual. Los pagos se procesan a través de PayPal. Komunio no almacena información de tarjetas de crédito. Las suscripciones se renuevan automáticamente hasta que sean canceladas.' },
          { title: '6. Cancelaciones y reembolsos', body: 'Los creadores pueden cancelar su suscripción a Komunio en cualquier momento desde su panel de configuración. Los miembros de comunidades pueden cancelar sus membresías conforme a la política de cada comunidad. Komunio no garantiza reembolsos de comisiones ya procesadas. En casos de error técnico, evaluaremos reembolsos caso por caso.' },
          { title: '7. Propiedad intelectual', body: 'Los creadores conservan todos los derechos sobre el contenido que publican. Al publicar contenido en Komunio, otorgan a Komunio una licencia limitada para mostrarlo dentro de la plataforma. Komunio y sus logos son propiedad de Komunio. No se permite usar nuestras marcas sin autorización previa por escrito.' },
          { title: '8. Limitación de responsabilidad', body: 'Komunio no es responsable del contenido publicado por los creadores. No garantizamos que la plataforma esté libre de errores o interrupciones. En ningún caso nuestra responsabilidad superará el monto pagado por el usuario en los últimos 3 meses. No somos responsables por pérdidas indirectas, incidentales o consecuentes.' },
          { title: '9. Terminación', body: 'Komunio puede suspender o terminar cuentas que violen estos términos, realicen fraude, publiquen contenido ilegal o dañino, o no paguen las tarifas correspondientes. Usted puede cerrar su cuenta en cualquier momento. Al cerrar una cuenta, los datos serán eliminados conforme a nuestra Política de Privacidad.' },
          { title: '10. Ley aplicable', body: 'Estos términos se rigen por las leyes de la República de Panamá. Cualquier disputa será resuelta mediante arbitraje en Ciudad de Panamá. Si alguna cláusula es inválida, el resto de los términos permanecen en vigor.' },
          { title: '11. Contacto', body: 'Para consultas sobre estos términos: hola@komunio.app · comunio.vercel.app' },
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
