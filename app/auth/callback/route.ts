import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const { searchParams } = requestUrl
    // Use the actual request origin if no env var is provided, avoids jumping between VPS and Prod during tests
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    // We create a response object early so we can attach cookies to it
    const response = NextResponse.redirect(`${BASE_URL}${next}`)

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        const cookieHeader = request.headers.get('Cookie') ?? ''
                        return cookieHeader.split(';').map(c => {
                            const [name, ...value] = c.trim().split('=')
                            return { name, value: value.join('=') }
                        })
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, options)
                        })
                    },
                },
            }
        )

        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            console.log(`Auth Callback: User ${user.email} logged in. Intent next: ${next}`)

            // 1. Fetch profile to determine if user exists and their role
            const { data: profile } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', user.id)
                .maybeSingle()

            // 2. Intelligent Redirect Logic
            let finalRedirect = next

            if (profile) {
                console.log(`Auth Callback: Existing profile found (${(profile as any).user_type}). Redirecting to dashboard.`)
                const existingRole = (profile as any).user_type
                
                // VERIFICAR SI LA CUENTA SE ACABA DE CREAR (hace menos de 1 minuto)
                const isNewUser = new Date(user.created_at).getTime() > Date.now() - 60000

                if (isNewUser) {
                    // Es un usuario de Google nuevo. El Trigger de DB omitió el rol y puso TALENT por defecto.
                    // Corregimos de forma segura según la intención real.
                    if (next.includes('/employer/register') && existingRole !== 'BUSINESS') {
                        await supabase.from('profiles').update({ user_type: 'BUSINESS' }).eq('id', user.id)
                        await supabase.auth.updateUser({ data: { user_type: 'BUSINESS', role: 'employer' } })
                        finalRedirect = '/employer/register'
                    } else if (next.includes('/talent/register') && existingRole !== 'TALENT') {
                        await supabase.from('profiles').update({ user_type: 'TALENT' }).eq('id', user.id)
                        await supabase.auth.updateUser({ data: { role: 'talent' } })
                        finalRedirect = '/talent/register'
                    } else {
                        finalRedirect = existingRole === 'BUSINESS' ? '/employer/dashboard' : '/jobs'
                    }
                } else {
                    // Lógica para usuarios pre-existentes antiguos
                    // Bloquear registro cruzado: ya es postulante pero intenta ser emprendedor
                    if (existingRole === 'TALENT' && next.includes('/employer/register')) {
                        console.log('Auth Callback: Cross-role violation (TALENT trying to register as BUSINESS). Signing out.')
                        await supabase.auth.signOut()
                        finalRedirect = '/login?error=rol_invalido_emprendedor'
                    }
                    // Bloquear registro cruzado: ya es emprendedor pero intenta ser postulante
                    else if (existingRole === 'BUSINESS' && next.includes('/talent/register')) {
                        console.log('Auth Callback: Cross-role violation (BUSINESS trying to register as TALENT). Signing out.')
                        await supabase.auth.signOut()
                        finalRedirect = '/login?error=rol_invalido_postulante'
                    }
                    // If we are in a recovery flow, let 'next' take precedence
                    else if (next.includes('/reset-password')) {
                        finalRedirect = next
                    } else {
                        finalRedirect = existingRole === 'BUSINESS' ? '/employer/dashboard' : '/jobs'
                    }
                }
            } else {
                console.log('Auth Callback: No profile found. Handling registration flow...')
                if (next.includes('/employer/register')) {
                    await supabase.from('profiles').upsert({ id: user.id, user_type: 'BUSINESS' })
                    finalRedirect = '/employer/register'
                } else if (next.includes('/talent/register')) {
                    await supabase.from('profiles').upsert({ id: user.id, user_type: 'TALENT' })
                    finalRedirect = '/talent/register'
                } else {
                    finalRedirect = '/'
                }
            }

            console.log(`Auth Callback: Final redirection to ${BASE_URL}${finalRedirect}`)

            // Re-create redirect to the FINAL destination, preserving the cookies already set
            const finalResponse = NextResponse.redirect(`${BASE_URL}${finalRedirect}`)
            // Sync cookies from the temporary response to the final response
            response.headers.getSetCookie().forEach((cookieHeader) => {
                finalResponse.headers.append('Set-Cookie', cookieHeader)
            })

            finalResponse.headers.set('Cache-Control', 'no-store, max-age=0')
            return finalResponse
        } else {
            console.error('Auth Callback: Exchange code error:', error)
        }
    }

    return NextResponse.redirect(`${BASE_URL}/login?error=auth-callback-failed`)
}
