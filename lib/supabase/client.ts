import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { isTauri } from '@tauri-apps/api/core'

let client: SupabaseClient<Database> | undefined

export function createClient(): SupabaseClient<Database> {
  if (client) return client

  // Always use standard browser client (cookies) for both Web and Tauri
  // so that Next.js Server Components can read the session
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as any

  return client!
}
