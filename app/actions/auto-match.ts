'use server'

import { createClient } from '@/lib/supabase/server'
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
    const supabase = await createClient()

    console.log(`[Auto-Match] Starting triggerMatchesForJob for job: ${jobId}`)

    // 1. Fetch job details
    const { data: job, error: jobError } = await (supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single() as any)

    if (jobError) {
        console.error(`[Auto-Match] Error fetching job ${jobId}:`, jobError)
        return { success: false, message: 'Invalid job' }
    }

    if (!job || job.status !== 'active') {
        console.log(`[Auto-Match] Job ${jobId} is not active or not found. Status: ${job?.status}`)
        return { success: false, message: 'Job not active' }
    }

    if (!job.latitude || !job.longitude) {
        console.log(`[Auto-Match] Job ${jobId} has no coordinates. Skipping distance matching.`)
        return { success: false, message: 'Coordinates missing' }
    }

    // 2. Fetch all talents that have the matching position
    const { data: talents, error: talentError } = await (supabase
        .from('profiles')
        .select('id, full_name, position, latitude, longitude')
        .eq('user_type', 'TALENT')
        .not('position', 'is', null) as any)

    if (talentError || !talents) {
        return { success: false, message: 'Could not fetch talents' }
    }

    console.log(`[Auto-Match] Job ${jobId}: Found ${talents.length} talents with position. Filtering...`)

    const matches = []

    for (const talent of talents) {
        // Case-insensitive position match
        const lowerJobTitle = job.title.toLowerCase()
        const positionMatch = Array.isArray(talent.position) &&
            talent.position.some((p: string) => p.toLowerCase() === lowerJobTitle)

        if (!positionMatch) continue

        const hasCoords = talent.latitude !== null && talent.longitude !== null
        if (hasCoords) {
            const distance = calculateDistance(
                job.latitude,
                job.longitude,
                talent.latitude,
                talent.longitude
            )

            // console.log(`Auto-Match Debug: Talent ${talent.full_name} is ${distance.toFixed(2)}km away. Radius: ${job.search_radius || 5}km`)

            if (distance <= (job.search_radius || 5)) {
                matches.push(talent)
            }
        }
    }

    console.log(`[Auto-Match] Job ${jobId}: Found ${matches.length} valid matches in radius.`)

    if (matches.length === 0) return { success: true, count: 0 }

    // 3. Create applications with 'auto-match' status
    for (const talent of matches) {
        // Check if application already exists
        const { data: existingApp } = await (supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', job.id)
            .eq('applicant_id', talent.id)
            .maybeSingle() as any)

        if (existingApp) continue

        try {
            await (supabase.from('job_applications') as any).insert({
                job_id: job.id,
                applicant_id: talent.id,
                status: 'auto-match'
            })
            console.log(`[Auto-Match] Created application for talent ${talent.id} on job ${job.id}`)
        } catch (appErr) {
            console.error(`[Auto-Match] Failed to create application:`, appErr)
            continue; // Skip if inserting application fails
        }

        // Update stats
        await incrementJobApplicationsAction(job.id)
        await incrementJobMatchesAction(job.id)

        // Ensure chat exists safely (pass created_by to avoid background auth errors)
        try {
            await getOrCreateChat(job.id, talent.id, job.created_by)
        } catch (chatError) {
            console.error(`[Auto-Match] Failed to create chat for ${talent.id}:`, chatError)
            // Continue anyway so notifications are sent
        }

        // 4. Notify both parties
        await sendNotification({
            userId: talent.id,
            title: '¡Nuevo Match Automático! 🎯',
            description: `Vimos que "${job.title}" en ${job.company || 'una empresa'} te queda cerca y coincide con tu perfil. ¡Míralo ahora!`,
            type: 'match',
            linkUrl: `/jobs`
        }).catch(console.error)

        await sendNotification({
            userId: job.created_by,
            title: 'Candidato Ideal Encontrado 🚀',
            description: `Hemos encontrado a ${talent.full_name || 'un candidato'} para tu puesto de "${job.title}". Se encuentra dentro de tu radio de búsqueda.`,
            type: 'match',
            linkUrl: `/employer/dashboard`
        }).catch(console.error)
    }

    return { success: true, count: matches.length }
}

/**
 * Matches a talent profile with existing active jobs.
 */
export async function triggerMatchesForTalent(talentId: string) {
    const supabase = await createClient()

    console.log(`[Auto-Match] Starting triggerMatchesForTalent for talent: ${talentId}`)

    // 1. Fetch talent details
    const { data: talent, error: talentError } = await (supabase
        .from('profiles')
        .select('*')
        .eq('id', talentId)
        .single() as any)

    if (talentError) {
        console.error(`[Auto-Match] Error fetching talent ${talentId}:`, talentError)
        return { success: false, message: 'Invalid talent' }
    }

    if (!talent.latitude || !talent.longitude || !talent.position || talent.position.length === 0) {
        console.log(`[Auto-Match] Talent ${talentId} misses coords or positions. Skipped.`)
        return { success: false, message: 'Data missing' }
    }

    // 2. Fetch all active jobs
    const { data: jobs, error: jobError } = await (supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null) as any)

    if (jobError || !jobs) {
        return { success: false, message: 'Could not fetch jobs' }
    }

    console.log(`[Auto-Match] Talent ${talentId}: Found ${jobs.length} active jobs. Filtering...`)

    const matches = []

    for (const job of jobs) {
        // Case-insensitive position match
        const lowerJobTitle = job.title.toLowerCase()
        const positionMatch = Array.isArray(talent.position) &&
            talent.position.some((p: string) => p.toLowerCase() === lowerJobTitle)

        if (!positionMatch) continue

        const distance = calculateDistance(
            talent.latitude,
            talent.longitude,
            job.latitude,
            job.longitude
        )

        // console.log(`Auto-Match Debug: Job "${job.title}" is ${distance.toFixed(2)}km away. Radius: ${job.search_radius || 5}km`)

        // For talent matching, we use the job's required radius or a default
        if (distance <= (job.search_radius || 5)) {
            matches.push(job)
        }
    }

    console.log(`[Auto-Match] Talent ${talentId}: Found ${matches.length} valid job matches in radius.`)

    if (matches.length === 0) return { success: true, count: 0 }

    // 3. Create applications
    for (const job of matches) {
        const { data: existingApp } = await (supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', job.id)
            .eq('applicant_id', talent.id)
            .maybeSingle() as any)

        if (existingApp) continue

        try {
            await (supabase.from('job_applications') as any).insert({
                job_id: job.id,
                applicant_id: talent.id,
                status: 'auto-match'
            })
            console.log(`[Auto-Match] Created application for talent ${talent.id} on job ${job.id}`)
        } catch (appErr) {
            console.error(`[Auto-Match] Failed to create application:`, appErr)
            continue; // Skip if inserting application fails
        }

        // Update stats
        await incrementJobApplicationsAction(job.id)
        await incrementJobMatchesAction(job.id)

        // Ensure chat exists (pass created_by to avoid background auth errors)
        try {
            await getOrCreateChat(job.id, talent.id, job.created_by)
        } catch (chatError) {
            console.error(`[Auto-Match] Failed to create chat for ${talent.id}:`, chatError)
        }

        // 4. Notify both parties
        await sendNotification({
            userId: talent.id,
            title: '¡Nuevo Match Automático! 🎯',
            description: `Tu perfil coincide con "${job.title}" en ${job.company || 'una empresa'}. ¡Mira la oferta!`,
            type: 'match',
            linkUrl: `/jobs`
        }).catch(console.error)

        await sendNotification({
            userId: job.created_by,
            title: 'Candidato Ideal Encontrado 🚀',
            description: `Hemos encontrado a ${talent.full_name || 'un candidato'} para tu puesto de "${job.title}".`,
            type: 'match',
            linkUrl: `/employer/dashboard`
        }).catch(console.error)
    }

    return { success: true, count: matches.length }
}
