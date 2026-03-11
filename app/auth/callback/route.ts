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
            console.log(`Auth Callback: User ${user.email} logged in. Next path: ${next}`)

            // 1. Force profile creation/update for specific registration flows
            if (next.includes('/employer/register')) {
                console.log(`Auth Callback: Forcing BUSINESS role for ${user.email}`)
                await supabase.from('profiles').upsert({
                    id: user.id,
                    user_type: 'BUSINESS'
                })
            } else if (next.includes('/talent/register')) {
                console.log(`Auth Callback: Forcing TALENT role for ${user.email}`)
                await supabase.from('profiles').upsert({
                    id: user.id,
                    user_type: 'TALENT'
                })
            }

            // 2. Intelligent Redirect Logic
            let finalRedirect = next

            // If we are at the root, we must decide where to go INSTEAD of going to Home
            if (next === '/') {
                console.log('Auth Callback: Identifying role for direct dashboard redirect...')

                // Fetch profile to determine destination
                let { data: profile } = await supabase
                    .from('profiles')
                    .select('user_type')
                    .eq('id', user.id)
                    .maybeSingle()

                // If profile doesn't exist yet (brand new user), wait a tiny bit and retry ONCE
                if (!profile) {
                    await new Promise(resolve => setTimeout(resolve, 800))
                    const { data: retryProfile } = await supabase
                        .from('profiles')
                        .select('user_type')
                        .eq('id', user.id)
                        .maybeSingle()
                    profile = retryProfile
                }

                if (profile?.user_type === 'BUSINESS') {
                    finalRedirect = '/employer/dashboard'
                } else if (profile?.user_type === 'TALENT') {
                    finalRedirect = '/jobs'
                } else {
                    // Default fallback if role is still unknown (e.g. brand new user without role yet)
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
