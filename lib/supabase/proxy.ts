import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = [
  '/dashboard',
  '/profile',
  '/post-job',
  '/my-applications',
  '/matches',
  '/chat',
  '/interviews',
  '/notifications',
  '/admin',
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Use getSession() instead of getUser() in middleware.
  // getSession() reads the JWT from the cookie locally — NO network call.
  // This is instant and avoids the "fetch failed" / timeout errors in local dev.
  // Security note: individual pages still call getUser() to validate with the server.
  let user = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    user = session?.user ?? null
  } catch (err) {
    console.warn('Middleware: getSession failed:', err)
    // Continue without user on error
  }

  if (isProtected && !user) {
    const url = new URL('/login', 'https://www.goscentral.online')
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If logged in user visits auth pages (except callback), redirect to home
  if (user && request.nextUrl.pathname.startsWith('/auth/') && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    const url = new URL('/', 'https://www.goscentral.online')
    return NextResponse.redirect(url)
  }

  // Instant redirect for logged-in users visiting the homepage
  if (user && request.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.user_type) {
      const pathname = profile.user_type === 'BUSINESS' ? '/employer/dashboard' : '/jobs'
      const url = new URL(pathname, 'https://www.goscentral.online')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
