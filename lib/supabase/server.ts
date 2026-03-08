import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { setDefaultResultOrder } from 'dns'

// Force Node.js (v18+) to prefer IPv4 when resolving supabase.co. 
// This fixes ECONNRESET and UND_ERR_CONNECT_TIMEOUT issues in local development.
setDefaultResultOrder('ipv4first')

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  // Fix for Next.js / Node 18+ IPv6 timeout issues in local development (ECONNRESET / UND_ERR_CONNECT_TIMEOUT)
  // We use a simple custom fetch wrapper that asks Node to prefer IPv4 if it's struggling.
  const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    return fetch(url, {
      ...options,
      // @ts-ignore - Next.js extended fetch options
      duplex: 'half',
    });
  };

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
      // Pass the custom fetch to fix ECONNRESET
      global: {
        fetch: customFetch
      }
    },
  )
}
