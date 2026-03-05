import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigValid = (config: any) => {
    return !!(config.apiKey && config.projectId && config.appId && config.messagingSenderId);
};

// Initialize Firebase only if it hasn't been initialized already and config is valid
export const app = (() => {
    if (getApps().length > 0) return getApps()[0];

    if (!isConfigValid(firebaseConfig)) {
        console.error("Firebase configuration is missing required values. Check your environment variables.", {
            hasApiKey: !!firebaseConfig.apiKey,
            hasProjectId: !!firebaseConfig.projectId,
            hasAppId: !!firebaseConfig.appId,
            hasMessagingSenderId: !!firebaseConfig.messagingSenderId
        });
        // We still return initializeApp but with what we have to satisfy the type, 
        // or we could throw, but returning null might break other things.
        // Actually, let's just let it try or throw a clearer error.
    }

    return initializeApp(firebaseConfig);
})();

export const messaging = async () => {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
};

export const fetchToken = async () => {
    try {
        const msg = await messaging();
        if (!msg) return null;

        // Request permission if not already granted
        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') return null;

        const currentToken = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        return currentToken;
    } catch (err) {
        console.error("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        messaging().then(msg => {
            if (msg) {
                onMessage(msg, (payload) => {
                    resolve(payload);
                });
            }
        });
    });
