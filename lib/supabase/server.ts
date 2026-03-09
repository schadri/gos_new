import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  let customFetch = undefined;

  if (process.env.NODE_ENV === 'development') {
    try {
      const dns = require('dns');
      dns.setDefaultResultOrder('ipv4first');
    } catch (e) {
      // Ignore
    }

    customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
      return fetch(url, {
        ...options,
        // @ts-ignore
        duplex: 'half',
      });
    };
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
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
      global: customFetch ? { fetch: customFetch } : undefined
    },
  )
}
