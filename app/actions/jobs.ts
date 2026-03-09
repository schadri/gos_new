'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'

// We need to use the service role key to bypass RLS since the postulant doesn't own the job they are applying or viewing.
// The standard client is bound by RLS policies where `auth.uid() = created_by` to update a job.
// Combined with centralized getSupabaseAdmin in lib/supabase/admin.ts


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
        console.log(`[Jobs Action] Incrementing applications for job: ${jobId}`);
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin.rpc('increment_job_applications', {
            job_uuid: jobId
        })
        if (error) console.error('[Jobs Action] Error incrementing apps count:', error)
    } catch (err) {
        console.error('[Jobs Action] Failed to increment job applications:', err)
    }
}
export async function incrementJobMatchesAction(jobId: string) {
    try {
        console.log(`[Jobs Action] Incrementing matches for job: ${jobId}`);
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin.rpc('increment_job_contacted_count', {
            job_uuid: jobId
        })
        if (error) console.error('[Jobs Action] Error incrementing matches count:', error)
    } catch (err) {
        console.error('[Jobs Action] Failed to increment job matches:', err)
    }
}
