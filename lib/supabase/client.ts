import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { isTauri } from '@tauri-apps/api/core'

let client: SupabaseClient<Database> | undefined

export function createClient(): SupabaseClient<Database> {
  if (client) return client

  // If in Tauri, use standard createClient with localStorage for better PKCE stability
  if (typeof window !== 'undefined' && isTauri()) {
    client = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        }
      }
    )
  } else {
    // For web/SSR, use the standard browser client (cookies)
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ) as any
  }

  return client!
}
