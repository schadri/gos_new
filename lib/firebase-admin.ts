import * as admin from 'firebase-admin';

// Limpieza profunda de la clave antes de validar
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey
    ? rawKey
        .replace(/^['"]|['"]$/g, '') // Elimina comillas simples o dobles al principio y final
        .replace(/\\n/g, '\n')       // Convierte los \n de texto en saltos de línea reales
        .trim()                       // Saca espacios invisibles
    : undefined;

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
        console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
        // Al capturar el error aquí, el servidor NO se cae y evitamos el 503
        console.error('❌ Error crítico inicializando Firebase Admin:', error);
    }
} else if (!isConfigValid) {
    console.warn('⚠️ Firebase Admin salteado: Faltan variables de entorno o la clave está vacía.');
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : {
    send: async () => {
        console.warn('adminMessaging.send salteado: Firebase Admin no está configurado.');
        return null;
    }
} as any; import * as admin from 'firebase-admin';

// Limpieza profunda de la clave antes de validar
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey
    ? rawKey
        .replace(/^['"]|['"]$/g, '') // Elimina comillas simples o dobles al principio y final
        .replace(/\\n/g, '\n')       // Convierte los \n de texto en saltos de línea reales
        .trim()                       // Saca espacios invisibles
    : undefined;

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
        console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
        // Al capturar el error aquí, el servidor NO se cae y evitamos el 503
        console.error('❌ Error crítico inicializando Firebase Admin:', error);
    }
} else if (!isConfigValid) {
    console.warn('⚠️ Firebase Admin salteado: Faltan variables de entorno o la clave está vacía.');
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : {
    send: async () => {
        console.warn('adminMessaging.send salteado: Firebase Admin no está configurado.');
        return null;
    }
} as any;