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
        const { data: profile, error } = await (supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', userId)
            .maybeSingle() as any)

        if (error || !profile?.fcm_token) {
            console.log(`Push notification skipped for user ${userId}: No valid FCM token found in Supabase.`)
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
    } catch (error: any) {
        console.error(`Error sending push notification to user ${userId}:`, error)
        if (error.code === 'messaging/registration-token-not-registered') {
            console.log('The registration token is not valid anymore. Cleaning up...');
            // Optional: remove invalid token from DB
        }
        return null
    }
}
