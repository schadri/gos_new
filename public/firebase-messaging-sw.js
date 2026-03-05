importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// Try to grab config from URL parameters (if we inject them later), or just leave empty but valid logic.
// For the service worker to receive foreground/background messages independently, it needs its own config.
// The easiest way is to let Next.js inject env variables or use a fixed config here if exposed.
// Since these are public API keys, it is safe to hardcode them here or replace them in build step.
// For now, we will add placeholders that the user must fill, or we can use a clever URL parameter trick.

self.addEventListener('install', function (event) {
    console.log('FCM Service Worker installed');
});

self.addEventListener('activate', function (event) {
    console.log('FCM Service Worker activated');
});

// Since we cannot use process.env here directly without a bundler, 
// we will intercept a message from the client to initialize with the correct config.
let messaging = null;

// Hardcoded config for background reliability (since process.env isn't available in public JS)
const firebaseConfig = {
  apiKey: "AIzaSyC8p85DtyrAK0zDbvRDvaftiJByrrq1Xl4",
  authDomain: "gosapp.firebaseapp.com",
  projectId: "gosapp",
  storageBucket: "gosapp.firebasestorage.app",
  messagingSenderId: "571996893586",
  appId: "1:571996893586:web:a5cf0b415e0a65a054114b",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification?.title || payload.data?.title || 'Nueva Notificación';
        const notificationOptions = {
            body: payload.notification?.body || payload.data?.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: payload.data,
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

self.addEventListener('message', (event) => {
    // This listener can still be used if there's a need to update config or perform other actions
    // from the client, but the primary messaging setup is now handled by the hardcoded config.
    // If the client sends a FIREBASE_CONFIG message, it will re-initialize, which might be redundant
    // or cause issues if not handled carefully. For now, we'll keep it as is, but the hardcoded
    // config ensures background messages work even without the client message.
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        const clientFirebaseConfig = event.data.config;
        // Optionally, re-initialize if the client config is different or if we want to prioritize client config
        // For this change, we prioritize the hardcoded config for background reliability.
        // If you want the client config to override, you'd need more complex logic here.
        console.log('Received FIREBASE_CONFIG from client, but using hardcoded config for background.');
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            const click_actions = event.notification.data?.click_action || '/';
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If so, just focus it.
                if (client.url.includes(click_actions) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(click_actions);
            }
        })
    );
});
