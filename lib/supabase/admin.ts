import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the Service Role key to bypass RLS.
 * Includes a fix for Next.js 18+ half-duplex ECONNRESET bug in local development.
 */
export function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error('Missing Supabase Admin credentials. Check your environment variables.');
    }

    let customFetch = undefined;

    if (process.env.NODE_ENV === 'development') {
        try {
            // Force IPv4 in Node.js Local Development safely
            const dns = require('dns');
            dns.setDefaultResultOrder('ipv4first');
        } catch (e) {
            // Ignore in edge runtimes
        }

        // Fix Next.js 18+ half-duplex ECONNRESET bug locally
        customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
            return fetch(url, {
                ...options,
                // @ts-ignore
                duplex: 'half',
            });
        };
    }

    return createClient(url, key, {
        global: customFetch ? { fetch: customFetch } : undefined
    })
}
