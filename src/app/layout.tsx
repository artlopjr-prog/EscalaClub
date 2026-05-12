import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'EscalaClub — La plataforma de comunidades de LATAM',
  description: 'Crea tu comunidad, sube tus cursos, conecta con miles de emprendedores en Latinoamérica.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning style={{ background: '#06060A' }}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #06060A !important; color: #EEEDF5 !important; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100vh; }
          #__next, main { background: #06060A; }
        `}</style>
      </head>
      <body style={{ background: '#06060A', color: '#EEEDF5', minHeight: '100vh' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D0D14',
              color: '#EEEDF5',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
