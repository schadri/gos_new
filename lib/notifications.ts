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
    data = {},
    forceSystem = false // New parameter
}: PushNotificationParams & { forceSystem?: boolean }) {
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

        const message: any = {
            token: profile.fcm_token,
            data: {
                ...data,
                title,
                body,
                click_action: link,
                force_system: forceSystem ? 'true' : 'false'
            },
            webpush: {
                notification: forceSystem ? undefined : {
                    title,
                    body,
                    icon: '/apple-icon.png',
                    badge: '/apple-icon.png',
                },
                fcm_options: {
                    link,
                },
            },
        }

        // If not forcing system (background style), we include the notification block
        if (!forceSystem) {
            message.notification = {
                title,
                body,
            }
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
