import * as admin from 'firebase-admin';

const isConfigValid = !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
);

if (!admin.apps.length && isConfigValid) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Remove wrapping quotes if they were pasted in Coolify, and unescape newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
} else if (!isConfigValid) {
    console.warn('Firebase admin initialization skipped: Missing environment variables (FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY)');
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : {
    send: async () => {
        console.warn('adminMessaging.send skipped: Firebase Admin not initialized.');
        return null;
    }
} as any;
