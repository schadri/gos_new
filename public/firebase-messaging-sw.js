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

// Initialized via message from client
let firebaseConfig = null;
let messaging = null;

const initializeMessaging = (config) => {
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
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
};

// Redundant initialization removed - now handled via message event

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        firebaseConfig = event.data.config;
        console.log('[firebase-messaging-sw.js] Received config from client');
        initializeMessaging(firebaseConfig);
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
