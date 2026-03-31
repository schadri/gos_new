import * as admin from 'firebase-admin';

// 1. Limpieza de la clave privada
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey
    ? rawKey
        .replace(/^['"]|['"]$/g, '') // Elimina comillas
        .replace(/\\n/g, '\n')       // Arregla saltos de línea
        .trim()
    : undefined;

// 2. Validación de configuración
const isConfigValid = !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    formattedKey
);

// 3. Inicialización (Singleton)
if (!admin.apps.length && isConfigValid) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: formattedKey,
            }),
        });
        console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
        console.error('❌ Error crítico inicializando Firebase Admin:', error);
    }
} else if (!isConfigValid) {
    console.warn('⚠️ Firebase Admin salteado: Faltan variables de entorno.');
}

// 4. Exportación de servicios
export const adminMessaging = admin.apps.length > 0
    ? admin.messaging()
    : {
        send: async () => {
            console.warn('adminMessaging.send salteado: Firebase Admin no configurado.');
            return null;
        }
    } as any;

export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;