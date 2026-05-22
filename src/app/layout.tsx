import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Komunio — La plataforma de comunidades de LATAM',
  description: 'Crea tu comunidad, sube tus cursos, conecta con miles de emprendedores en Latinoamérica.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: 'var(--bg)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning style={{ background: 'var(--bg)' }}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              // Siempre forzar light mode — borrar cualquier preferencia dark anterior
              localStorage.removeItem('ec-theme');
              localStorage.removeItem('ec-theme-v3');
              localStorage.removeItem('theme');
              document.documentElement.setAttribute('data-theme', 'light');
              document.documentElement.style.background = '#FFFFFF';
              document.documentElement.style.color = '#0F0F0F';
            } catch(e) {}
          })();
        ` }} />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { 
            background: #FFFFFF !important; 
            color: #0F0F0F !important; 
            font-family: 'Inter', system-ui, sans-serif; 
            min-height: 100vh;
            overflow-x: hidden;
          }
          html[data-theme="dark"], html[data-theme="dark"] body { 
            background: #0A0A0F !important; 
            color: #EDEDED !important; 
          }
        `}</style>
      </head>
      <body style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg1)',
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
