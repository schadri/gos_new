'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendNotification } from './notifications'
import { incrementJobApplicationsAction, incrementJobMatchesAction } from './jobs'
import { getOrCreateChat } from './chat'

/**
 * Calculates the distance between two points in kilometers using the Haversine formula.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
}

/**
 * Matches a newly published job with existing talent profiles.
 */
export async function triggerMatchesForJob(jobId: string) {
    let supabaseAdmin;
    try {
        supabaseAdmin = getSupabaseAdmin()
        console.log(`[Auto-Match] Starting triggerMatchesForJob for job: ${jobId}`)
    } catch (initErr) {
        console.error('[Auto-Match] Failed to initialize admin client in triggerMatchesForJob:', initErr)
        return { success: false, message: 'Initialization failed' }
    }

    // 1. Fetch job details
    console.log(`[Auto-Match] [${new Date().toLocaleTimeString()}] Step 1: Fetching job details for ${jobId}`)
    const { data: job, error: jobError } = await (supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single() as any)

    if (jobError || !job || job.status !== 'active') {
        console.error(`[Auto-Match] Job mismatch/inactive: ${jobId}`, jobError)
        return { success: false, message: 'Invalid or inactive job' }
    }

    if (!job.latitude || !job.longitude) {
        console.log(`[Auto-Match] Job ${jobId} has no coordinates. Skipping matching.`)
        return { success: false, message: 'Coordinates missing' }
    }

    // 2. Fetch all talents
    console.log(`[Auto-Match] [${new Date().toLocaleTimeString()}] Step 2: Fetching matching talents`)
    const { data: talents, error: talentError } = await (supabaseAdmin
        .from('profiles')
        .select('id, full_name, position, latitude, longitude')
        .eq('user_type', 'TALENT')
        .not('position', 'is', null) as any)

    if (talentError || !talents) {
        console.error(`[Auto-Match] Failed to fetch talents:`, talentError)
        return { success: false, message: 'Could not fetch talents' }
    }

    const lowerJobTitle = (job.title || '').toLowerCase()
    let matchCount = 0

    // 3. Process matches
    console.log(`[Auto-Match] [${new Date().toLocaleTimeString()}] Step 3: Starting match processing for ${talents.length} candidates`)
    for (const talent of talents) {
        try {
            // Case-insensitive position match
            const talentPositions = Array.isArray(talent.position) ? talent.position : (typeof talent.position === 'string' ? [talent.position] : [])
            const positionMatch = talentPositions.some((p: string) => (p || '').toLowerCase() === lowerJobTitle)
            if (!positionMatch) continue

            // Distance check
            if (talent.latitude === null || talent.longitude === null) continue
            const distance = calculateDistance(job.latitude, job.longitude, talent.latitude, talent.longitude)

            if (distance <= (job.search_radius || 5)) {
                // Check if already applied
                console.log(`[Auto-Match] Potential match: ${talent.full_name}. Checking existence...`)
                const { data: exists } = await (supabaseAdmin
                    .from('job_applications')
                    .select('id')
                    .eq('job_id', job.id)
                    .eq('applicant_id', talent.id)
                    .maybeSingle() as any)
                if (exists) continue

                // Insert application
                const { error: insErr } = await (supabaseAdmin.from('job_applications') as any).insert({
                    job_id: job.id,
                    applicant_id: talent.id,
                    status: 'auto-match'
                })
                if (insErr) {
                    console.error(`[Auto-Match] Insert error:`, insErr)
                    continue
                }

                // Stats and notifications
                await incrementJobApplicationsAction(job.id)
                await incrementJobMatchesAction(job.id)

                try {
                    await getOrCreateChat(job.id, talent.id, job.created_by)
                } catch (ce) { console.error('[Auto-Match] Chat creation failed:', ce) }

                await sendNotification({
                    userId: talent.id,
                    title: '¡Nuevo Match Automático! 🎯',
                    description: `Vimos que "${job.title}" en ${job.company || 'una empresa'} coincide con tu perfil.`,
                    type: 'match',
                    linkUrl: `/profile`
                }).catch(console.error)

                await sendNotification({
                    userId: job.created_by,
                    title: 'Candidato Ideal Encontrado 🚀',
                    description: `Hemos encontrado a ${talent.full_name || 'un candidato'} para tu puesto de "${job.title}".`,
                    type: 'match',
                    linkUrl: `/employer/dashboard`
                }).catch(console.error)

                matchCount++
                console.log(`[Auto-Match] Linked talent ${talent.full_name} to job ${job.title}`)
            }
        } catch (err) {
            console.error('[Auto-Match] Error in loop:', err)
        }
    }

    return { success: true, count: matchCount }
}

/**
 * Matches a talent profile with existing active jobs.
 */
export async function triggerMatchesForTalent(talentId: string) {
    let supabaseAdmin;
    try {
        supabaseAdmin = getSupabaseAdmin()
        console.log(`[Auto-Match] Starting triggerMatchesForTalent for: ${talentId}`)
    } catch (initErr) {
        console.error('[Auto-Match] Failed to initialize admin client in triggerMatchesForTalent:', initErr)
        return { success: false, message: 'Initialization failed' }
    }

    // 1. Fetch talent details
    console.log(`[Auto-Match] [${new Date().toLocaleTimeString()}] Step 1: Fetching talent details for ${talentId}`)
    const { data: talent, error: talentError } = await (supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', talentId)
        .single() as any)

    if (talentError || !talent) {
        console.error(`[Auto-Match] Talent mismatch: ${talentId}`, talentError)
        return { success: false, message: 'Invalid talent' }
    }

    if (!talent.latitude || !talent.longitude || !talent.position) {
        console.log(`[Auto-Match] Talent ${talentId} misses coords or positions.`)
        return { success: false, message: 'Data missing' }
    }

    // 2. Fetch active jobs
    console.log(`[Auto-Match] [${new Date().toLocaleTimeString()}] Step 2: Fetching active jobs`)
    const { data: jobs, error: jobError } = await (supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null) as any)

    if (jobError || !jobs) {
        console.error(`[Auto-Match] Failed to fetch jobs:`, jobError)
        return { success: false, message: 'Could not fetch jobs' }
    }

    const talentPositions = Array.isArray(talent.position) ? talent.position : (typeof talent.position === 'string' ? [talent.position] : [])
    let matchCount = 0

    // 3. Process matches
    console.log(`[Auto-Match] [${new Date().toLocaleTimeString()}] Step 3: Starting match processing for ${jobs.length} jobs`)
    for (const job of jobs) {
        try {
            const lowerJobTitle = (job.title || '').toLowerCase()
            const positionMatch = talentPositions.some((p: string) => (p || '').toLowerCase() === lowerJobTitle)
            if (!positionMatch) continue

            const distance = calculateDistance(talent.latitude, talent.longitude, job.latitude, job.longitude)

            if (distance <= (job.search_radius || 5)) {
                // Check if already applied
                console.log(`[Auto-Match] Potential match found for job: ${job.title}. Checking existence...`)
                const { data: exists } = await (supabaseAdmin
                    .from('job_applications')
                    .select('id')
                    .eq('job_id', job.id)
                    .eq('applicant_id', talent.id)
                    .maybeSingle() as any)
                if (exists) continue

                // Insert application
                const { error: insErr } = await (supabaseAdmin.from('job_applications') as any).insert({
                    job_id: job.id,
                    applicant_id: talent.id,
                    status: 'auto-match'
                })
                if (insErr) {
                    console.error(`[Auto-Match] Insert error:`, insErr)
                    continue
                }

                // Stats and notifications
                await incrementJobApplicationsAction(job.id)
                await incrementJobMatchesAction(job.id)

                try {
                    await getOrCreateChat(job.id, talent.id, job.created_by)
                } catch (ce) { console.error('[Auto-Match] Chat creation failed:', ce) }

                await sendNotification({
                    userId: talent.id,
                    title: '¡Match Encontrado! 🎯',
                    description: `Tu perfil coincide con "${job.title}" en ${job.company || 'una empresa'}.`,
                    type: 'match',
                    linkUrl: `/profile`
                }).catch(console.error)

                await sendNotification({
                    userId: job.created_by,
                    title: 'Candidato Ideal Encontrado 🚀',
                    description: `${talent.full_name || 'Un candidato'} coincide con tu búsqueda de "${job.title}".`,
                    type: 'match',
                    linkUrl: `/employer/dashboard`
                }).catch(console.error)

                matchCount++
                console.log(`[Auto-Match] Linked talent ${talent.full_name} to job ${job.title}`)
            }
        } catch (err) {
            console.error('[Auto-Match] Error in talent trigger loop:', err)
        }
    }

    return { success: true, count: matchCount }
}
