'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Called secretly when an employer clicks "Match!"
export async function createMatchNotification(applicantId: string, jobId: string, companyName: string) {
    const supabase = await createClient()

    // Generate the chat route string (we assume it gets created at match time or they open it)
    // For safety, link to their profile where they can see the "Ir al Chat" button
    const linkUrl = '/profile'

    await supabase
        .from('notifications')
        .insert({
            user_id: applicantId,
            type: 'match',
            title: '¡Nuevo Match! Una empresa quiere conectar contigo',
            description: `${companyName} ha avanzado tu postulación a la fase de Entrevista. ¡Entra al Chat para responderles!`,
            link_url: linkUrl,
            is_read: false
        })

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
