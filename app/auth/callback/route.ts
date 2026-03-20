import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && user) {
            console.log(`Auth Callback: User ${user.email} logged in. Next path: ${next}`)

            // Early assignment based on the registration URL flow
            if (next.includes('/employer/register')) {
                console.log(`Auth Callback: Forcing BUSINESS role for ${user.email}`)
                const { error: upsertError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    user_type: 'BUSINESS'
                })
                if (upsertError) console.error('Auth Callback: Upsert Error:', upsertError)
            } else if (next.includes('/talent/register')) {
                console.log(`Auth Callback: Forcing TALENT role for ${user.email}`)
                const { error: upsertError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    user_type: 'TALENT'
                })
                if (upsertError) console.error('Auth Callback: Upsert Error:', upsertError)
            }

            let finalRedirect = next
            if (next === '/') {
                console.log('Auth Callback: Next is root, checking profile role...')
                // Wait a bit for the trigger to finish if it's an insert
                await new Promise(resolve => setTimeout(resolve, 500))

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('user_type')
                    .eq('id', user.id)
                    .maybeSingle()

                if (profile?.user_type === 'BUSINESS') {
                    finalRedirect = '/employer/dashboard'
                } else if (profile?.user_type === 'TALENT') {
                    finalRedirect = '/jobs'
                } else {
                    console.log('Auth Callback: Profile type not found, staying on root.')
                }
                console.log(`Auth Callback: Root path redirect resolved to: ${finalRedirect}`)
            }

            console.log(`Auth Callback: Final redirection to ${origin}${finalRedirect}`)
            // Ensure no cache on redirect
            const response = NextResponse.redirect(`${origin}${finalRedirect}`)
            response.headers.set('Cache-Control', 'no-store, max-age=0')
            return response
        } else {
            console.error('Auth Callback: Exchange code error:', error)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
