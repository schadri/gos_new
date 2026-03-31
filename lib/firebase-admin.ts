import * as admin from 'firebase-admin';

const rawKey = process.env.FIREBASE_PRIVATE_KEY;

// Función para limpiar y decodificar la llave
const getCleanKey = (key: string | undefined) => {
    if (!key) return undefined;

    // Si no empieza con los guiones, asumimos que es Base64
    let decodedKey = key;
    if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
        try {
            decodedKey = Buffer.from(key, 'base64').toString('utf-8');
        } catch (e) {
            return undefined;
        }
    }

    // Limpieza final de comillas y saltos de línea de texto
    return decodedKey
        .replace(/^['"]|['"]$/g, '')
        .replace(/\\n/g, '\n')
        .trim();
};

const formattedKey = getCleanKey(rawKey);

const isConfigValid = !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    formattedKey
);

if (!admin.apps.length && isConfigValid) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: formattedKey,
            }),
        });
        console.log('✅ Firebase Admin: Inicializado con éxito');
    } catch (error) {
        // Capturamos el error para que NO tire el servidor (adiós al 503)
        console.error('⚠️ Firebase Admin: Error de formato en la llave, pero el servidor sigue vivo.');
    }
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : { send: async () => null } as any;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;