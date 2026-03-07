'use server'

import { createClient } from '@/lib/supabase/server'
import { sendNotification } from './notifications'
import { incrementJobApplicationsAction } from './jobs'

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

    // 1. Fetch job details
    const { data: job, error: jobError } = await (supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single() as any)

    if (jobError || !job || job.status !== 'active' || !job.latitude || !job.longitude) {
        return { success: false, message: 'Invalid job or coordinates missing' }
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

    const matches = []

    for (const talent of talents) {
        // Check if position matches (job title is in talent positions array)
        const positionMatch = Array.isArray(talent.position) && talent.position.includes(job.title)
        if (!positionMatch) continue

        if (talent.latitude && talent.longitude) {
            const distance = calculateDistance(
                job.latitude,
                job.longitude,
                talent.latitude,
                talent.longitude
            )

            if (distance <= (job.search_radius || 5)) {
                matches.push(talent)
            }
        }
    }

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

        await (supabase.from('job_applications') as any).insert({
            job_id: job.id,
            applicant_id: talent.id,
            status: 'auto-match'
        })

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

    // 1. Fetch talent details
    const { data: talent, error: talentError } = await (supabase
        .from('profiles')
        .select('*')
        .eq('id', talentId)
        .single() as any)

    if (talentError || !talent || !talent.latitude || !talent.longitude || !talent.position || talent.position.length === 0) {
        return { success: false, message: 'Invalid talent or data missing' }
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

    const matches = []

    for (const job of jobs) {
        // Check if position matches
        const positionMatch = Array.isArray(talent.position) && talent.position.includes(job.title)
        if (!positionMatch) continue

        const distance = calculateDistance(
            talent.latitude,
            talent.longitude,
            job.latitude,
            job.longitude
        )

        if (distance <= (job.search_radius || 5)) {
            matches.push(job)
        }
    }

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

        await (supabase.from('job_applications') as any).insert({
            job_id: job.id,
            applicant_id: talent.id,
            status: 'auto-match'
        })

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
