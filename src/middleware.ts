import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Pasar el pathname como header para que los layouts lo lean
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Rutas completamente públicas
  const publicPaths = ['/', '/login', '/registro', '/recuperar', '/terminos', '/privacidad', '/precios']

  // Explorador de comunidades público
  const isPublicCommunities = pathname === '/comunidades'

  // Landing pública de cada comunidad (solo /comunidades/[slug] exacto, NO subrutas)
  const isCommunityLanding = /^\/comunidades\/[^\/]+$/.test(pathname)

  if (publicPaths.includes(pathname) || isPublicCommunities || isCommunityLanding) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Todo lo demás requiere auth
  let response = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
