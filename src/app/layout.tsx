import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'EscalaClub — La plataforma de comunidades de LATAM',
  description: 'Crea tu comunidad, sube tus cursos, conecta con miles de emprendedores en Latinoamérica.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1F2335',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning style={{ background: '#1F2335' }}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('ec-theme') || 'light';
              document.documentElement.setAttribute('data-theme', t);
              document.documentElement.style.background = t === 'dark' ? 'var(--bg)' : '#FFFFFF';
            } catch(e) {}
          })();
        ` }} />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { 
            background: #1F2335 !important; 
            color: var(--text) !important; 
            font-family: 'Inter', system-ui, sans-serif; 
            min-height: 100vh;
            overflow-x: hidden;
          }
        `}</style>
      </head>
      <body style={{ background: '#1F2335', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#262B42',
              color: 'var(--text)',
              border: '1px solid var(--border2)',
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
