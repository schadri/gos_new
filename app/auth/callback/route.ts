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
            // Early assignment of user_type if registering
            if (next.includes('/employer/register')) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    user_type: 'BUSINESS'
                }).select()
            } else if (next.includes('/talent/register')) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    user_type: 'TALENT'
                }).select()
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
