'use server'

import { createClient } from '@supabase/supabase-js'

// We need to use the service role key to bypass RLS since the postulant doesn't own the job they are applying or viewing.
// The standard client is bound by RLS policies where `auth.uid() = created_by` to update a job.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function incrementJobViewsAction(jobId: string) {
    try {
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
        const { data: job, error: fetchError } = await supabaseAdmin
            .from('jobs')
            .select('applications_count')
            .eq('id', jobId)
            .single()

        if (fetchError || !job) return

        await supabaseAdmin
            .from('jobs')
            .update({ applications_count: (job.applications_count || 0) + 1 })
            .eq('id', jobId)
    } catch (err) {
        console.error('Failed to increment job applications:', err)
    }
}
