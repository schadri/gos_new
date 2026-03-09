'use server'

import { createClient } from '@supabase/supabase-js'

// We need to use the service role key to bypass RLS since the postulant doesn't own the job they are applying or viewing.
// The standard client is bound by RLS policies where `auth.uid() = created_by` to update a job.
function getSupabaseAdmin() {
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

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            global: customFetch ? { fetch: customFetch } : undefined
        }
    )
}

export async function incrementJobViewsAction(jobId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        // We first read the current views count
        const { data: job, error: fetchError } = await supabaseAdmin
            .from('jobs')
            .select('views_count')
            .eq('id', jobId)
            .single()

        if (fetchError || !job) return

        // Then increment
        await supabaseAdmin
            .from('jobs')
            .update({ views_count: (job.views_count || 0) + 1 })
            .eq('id', jobId)
    } catch (err) {
        console.error('Failed to increment job views:', err)
    }
}

export async function incrementJobApplicationsAction(jobId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin.rpc('increment_job_applications_count', {
            job_uuid: jobId
        })
        if (error) console.error('Error incrementing apps count:', error)
    } catch (err) {
        console.error('Failed to increment job applications:', err)
    }
}
export async function incrementJobMatchesAction(jobId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin.rpc('increment_job_contacted_count', {
            job_uuid: jobId
        })
        if (error) console.error('Error incrementing matches count:', error)
    } catch (err) {
        console.error('Failed to increment job matches:', err)
    }
}
