import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { nodeHttpsFetch } from '@/lib/native-fetch'

// Cache the admin client instance globally to prevent exhausting connections
// and avoids the overhead of creating a new client/TLS handshake for every operation.
let adminClient: SupabaseClient | null = null;

/**
 * Creates or returns a cached Supabase client with the Service Role key.
 * Uses a custom native node:https fetcher to bypass UND_ERR_CONNECT_TIMEOUT loops on Windows.
 */
export function getSupabaseAdmin() {
    if (adminClient) return adminClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error('Missing Supabase Admin credentials. Check your environment variables.');
    }

    let fetchObj = fetch;
    if (process.env.NODE_ENV === 'development') {
        fetchObj = nodeHttpsFetch as any;
    }

    adminClient = createClient(url, key, {
        global: {
            fetch: fetchObj
        }
    });

    return adminClient;
}
