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
    if (typeof window === 'undefined') return null;
    if (getApps().length > 0) return getApps()[0];

    if (!isConfigValid(firebaseConfig)) {
        console.warn("Firebase configuration is missing required values. Messaging features will be disabled until environment variables are set.");
        return null;
    }

    try {
        return initializeApp(firebaseConfig);
    } catch (err) {
        console.error("Firebase initialization failed:", err);
        return null;
    }
})();

export const messaging = async () => {
    if (!app) return null;
    try {
        const supported = await isSupported();
        if (!supported) return null;
        return getMessaging(app);
    } catch (err) {
        console.error("Firebase Messaging not supported or failed to initialize:", err);
        return null;
    }
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
