'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/notifications'

export async function sendTestNotification() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'User not authenticated' }
        }

        console.log(`Sending test notification to user ${user.id}...`)

        // Using forceSystem: true to ensure it bypasses foreground suppression
        const result = await sendPushNotification({
            userId: user.id,
            title: '¡Prueba de Sistema! 🔔',
            body: 'Esta debería aparecer en la barra de notificaciones del celular.',
            link: '/employer/dashboard',
            data: {
                type: 'test'
            },
            forceSystem: true
        })

        if (result) {
            return { success: true, message: 'Notificación enviada con éxito' }
        } else {
            return { success: false, error: 'No se pudo enviar. ¿Tienes un token en Supabase?' }
        }
    } catch (error: any) {
        console.error('Error in sendTestNotification:', error)
        return { success: false, error: error.message }
    }
}
