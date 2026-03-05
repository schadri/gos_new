'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function sendTestNotification() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'User not authenticated' }
        }

        console.log(`Sending test notification to user ${user.id}...`)

        const result = await sendPushNotification({
            userId: user.id,
            title: '¡Prueba Exitosa! 🎉',
            body: 'Si ves esto, las notificaciones "tipo WhatsApp" están funcionando correctamente.',
            link: '/employer/dashboard', // or wherever makes sense
            data: {
                type: 'test'
            }
        })

        if (result) {
            return { success: true, message: 'Notificación enviada con éxito' }
        } else {
            return { success: false, error: 'No se pudo enviar la notificación. Verifica si el token existe en tu perfil.' }
        }
    } catch (error: any) {
        console.error('Error in sendTestNotification:', error)
        return { success: false, error: error.message }
    }
}
