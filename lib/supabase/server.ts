import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { nodeHttpsFetch } from '@/lib/native-fetch'

export async function createClient() {
  const cookieStore = await cookies()

  let fetchObj = fetch;
  if (process.env.NODE_ENV === 'development') {
    fetchObj = nodeHttpsFetch as any;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
          }
        },
      },
      global: { fetch: fetchObj }
    },
  )
}
