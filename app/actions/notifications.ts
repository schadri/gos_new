'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Called secretly when an employer clicks "Match!"
export async function createMatchNotification(applicantId: string, jobId: string, companyName: string) {
    const supabase = await createClient()

    // Generate the chat route string (we assume it gets created at match time or they open it)
    // For safety, link to their profile where they can see the "Ir al Chat" button
    const linkUrl = '/profile'

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: applicantId,
            type: 'match',
            title: '¡Nuevo Match! Una empresa quiere conectar contigo',
            description: `${companyName} ha avanzado tu postulación a la fase de Entrevista. ¡Entra al Chat para responderles!`,
            link_url: linkUrl,
            is_read: false
        })

    if (error) {
        console.error('MATCH NOTIF ERROR:', error)
        throw new Error('No se pudo crear la notificacion de match: ' + error.message)
    }

    revalidatePath('/notifications')
}

// Called when someone sends a message
export async function createMessageNotification(recipientId: string, chatId: string, senderName: string) {
    const supabase = await createClient()

    // Ensure they don't get spammed if they already have an unread message notification for this chat
    const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', recipientId)
        .eq('type', 'message')
        .eq('link_url', `/chat/${chatId}`)
        .eq('is_read', false)
        .maybeSingle()

    if (existing) return

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: recipientId,
            type: 'message',
            title: 'Nuevo mensaje recibido',
            description: `Tienes un nuevo mensaje de ${senderName}.`,
            link_url: `/chat/${chatId}`,
            is_read: false
        })

    if (error) {
        console.error('MESSAGE NOTIF ERROR:', error)
        throw new Error('No se pudo crear la notificacion de mensaje: ' + error.message)
    }

    revalidatePath('/notifications')
}

// Called when an applicant applies to a job
export async function createApplicationNotification(employerId: string, jobId: string, applicantName: string, jobTitle: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: employerId,
            type: 'application_update',
            title: 'Nueva Postulación Recibida',
            description: `${applicantName} se ha postulado a tu oferta de "${jobTitle}". ¡Revisa su perfil!`,
            link_url: `/employer/jobs/${jobId}/applicants`,
            is_read: false
        })

    if (error) {
        console.error('NEW APPLICANT NOTIF ERROR:', error)
        throw new Error('No se pudo crear la notificacion de aplicante: ' + error.message)
    }

    revalidatePath('/notifications')
}

// Read logic
export async function markAsRead(notificationId: string) {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

    revalidatePath('/notifications')
    return { success: true }
}

export async function markAllAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    revalidatePath('/notifications')
    return { success: true }
}
