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
    const missing = [];
    if (!config.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!config.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!config.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
    if (!config.messagingSenderId) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");

    if (missing.length > 0) {
        console.warn("Missing Firebase Env Vars:", missing.join(", "));
        return false;
    }
    return true;
};

// Initialize Firebase lazily on the first call to a messaging function
let initializedApp: any = null;

export const getAppInstance = () => {
    if (typeof window === 'undefined') return null;
    if (initializedApp) return initializedApp;

    if (getApps().length > 0) {
        initializedApp = getApps()[0];
        return initializedApp;
    }

    if (!isConfigValid(firebaseConfig)) {
        console.warn("Firebase configuration is missing required values. Messaging features will be disabled until environment variables are set.");
        return null;
    }

    try {
        initializedApp = initializeApp(firebaseConfig);
        return initializedApp;
    } catch (err) {
        console.error("Firebase initialization failed:", err);
        return null;
    }
};

export const messaging = async () => {
    const app = getAppInstance();
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

        if (permission !== 'granted') {
            console.log("Notification permission not granted:", permission);
            return null;
        }

        const currentToken = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        return currentToken;
    } catch (err) {
        console.error("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const saveTokenToSupabase = async (token: string, supabase: any) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log("No user found, skipping token save.");
            return;
        }

        console.log(`Saving FCM token for user ${user.id}...`);
        const { error } = await supabase
            .from('profiles')
            .update({ fcm_token: token })
            .eq('id', user.id);

        if (error) throw error;
        console.log("FCM token saved successfully.");
    } catch (err) {
        console.error("Error saving FCM token to Supabase:", err);
    }
};

export const onMessageListener = (callback: (payload: any) => void) => {
    messaging().then(msg => {
        if (msg) {
            onMessage(msg, (payload) => {
                callback(payload);
            });
        }
    });
};
