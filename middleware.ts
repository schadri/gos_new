import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/post-job/:path*',
    '/my-applications/:path*',
    '/matches/:path*',
    '/chat/:path*',
    '/interviews/:path*',
    '/notifications/:path*',
    '/employer/:path*',
    '/jobs/:path*',
    '/auth/:path*',
    '/admin/:path*',
  ],
}
