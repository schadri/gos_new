import { adminMessaging } from './firebase-admin'
import { createClient } from './supabase/server'

interface PushNotificationParams {
    userId: string
    title: string
    body: string
    link?: string
    data?: Record<string, string>
}

export async function sendPushNotification({
    userId,
    title,
    body,
    link = '/',
    data = {}
}: PushNotificationParams) {
    try {
        const supabase = await createClient()

        // Fetch the user's FCM token
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', userId)
            .single()

        if (error || !profile?.fcm_token) {
            console.log(`Push notification skipped for user ${userId}: No FCM token found.`)
            return null
        }

        const message = {
            token: profile.fcm_token,
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: link,
            },
            webpush: {
                notification: {
                    icon: '/apple-icon.png',
                    badge: '/apple-icon.png',
                },
                fcm_options: {
                    link,
                },
            },
        }

        const response = await adminMessaging.send(message)
        console.log(`Successfully sent push notification to user ${userId}:`, response)
        return response
    } catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error)
        return null
    }
}
