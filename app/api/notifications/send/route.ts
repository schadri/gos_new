import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        })
    } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack)
    }
}

export async function POST(req: NextRequest) {
    try {
        const { token, title, body, icon, data, click_action } = await req.json()

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        const message = {
            token,
            notification: {
                title: title || 'Nueva Notificación',
                body: body || '',
            },
            data: {
                ...data,
                click_action: click_action || '/',
            },
            webpush: {
                notification: {
                    icon: icon || '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                },
                fcm_options: {
                    link: click_action || '/',
                },
            },
        }

        const response = await admin.messaging().send(message)
        return NextResponse.json({ success: true, response })
    } catch (error: any) {
        console.error('Error sending notification:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
