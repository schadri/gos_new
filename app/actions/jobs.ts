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

        const { data: job, error: fetchError } = await supabaseAdmin
            .from('jobs')
            .select('applications_count')
            .eq('id', jobId)
            .single()

        if (fetchError || !job) {
            console.error('[Jobs Action] Error fetching job for apps increment:', fetchError)
            return
        }

        const { error: updateError } = await supabaseAdmin
            .from('jobs')
            .update({ applications_count: (job.applications_count || 0) + 1 })
            .eq('id', jobId)

        if (updateError) console.error('[Jobs Action] Error incrementing apps count:', updateError)
    } catch (err) {
        console.error('[Jobs Action] Failed to increment job applications:', err)
    }
}

export async function incrementJobMatchesAction(jobId: string) {
    try {
        console.log(`[Jobs Action] Incrementing matches for job: ${jobId}`);
        const supabaseAdmin = getSupabaseAdmin()

        const { data: job, error: fetchError } = await supabaseAdmin
            .from('jobs')
            .select('contacted_count')
            .eq('id', jobId)
            .single()

        if (fetchError || !job) {
            console.error('[Jobs Action] Error fetching job for matches increment:', fetchError)
            return
        }

        const { error: updateError } = await supabaseAdmin
            .from('jobs')
            .update({ contacted_count: (job.contacted_count || 0) + 1 })
            .eq('id', jobId)

        if (updateError) console.error('[Jobs Action] Error incrementing matches count:', updateError)
    } catch (err) {
        console.error('[Jobs Action] Failed to increment job matches:', err)
    }
}
