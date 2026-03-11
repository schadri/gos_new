import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()

        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            console.log(`Auth Callback: User ${user.email} logged in. Intent next: ${next}`)

            // 1. Fetch profile to determine if user exists and their role
            let { data: profile } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', user.id)
                .maybeSingle()

            // 2. Intelligent Redirect Logic
            let finalRedirect = next

            if (profile) {
                console.log(`Auth Callback: Existing profile found (${(profile as any).user_type}). Redirecting to dashboard.`)
                finalRedirect = (profile as any).user_type === 'BUSINESS' ? '/employer/dashboard' : '/jobs'
            } else {
                console.log('Auth Callback: No profile found. Handling registration flow...')
                // If it's a new user and they came through a registration flow, force the profile creation
                if (next.includes('/employer/register')) {
                    await supabase.from('profiles').upsert({ id: user.id, user_type: 'BUSINESS' })
                    finalRedirect = '/employer/register'
                } else if (next.includes('/talent/register')) {
                    await supabase.from('profiles').upsert({ id: user.id, user_type: 'TALENT' })
                    finalRedirect = '/talent/register'
                } else {
                    // Brand new user without intent? Send to root or a default registration if needed
                    finalRedirect = '/'
                }
            }

            console.log(`Auth Callback: Final redirection to ${origin}${finalRedirect}`)

            const response = NextResponse.redirect(`${origin}${finalRedirect}`)
            response.headers.set('Cache-Control', 'no-store, max-age=0')
            return response
        } else {
            console.error('Auth Callback: Exchange code error:', error)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
