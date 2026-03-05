importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

self.addEventListener('install', function (event) {
    console.log('FCM Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('FCM Service Worker activated');
    event.waitUntil(clients.claim());
});

let firebaseConfig = null;
let messaging = null;

const initializeMessaging = (config) => {
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
        messaging = firebase.messaging();
        
        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Message received:', payload);
            
            const title = payload.notification?.title || payload.data?.title;
            const body = payload.notification?.body || payload.data?.body;

            if (title) {
                const notificationOptions = {
                    body: body,
                    icon: '/apple-icon.png',
                    badge: '/apple-icon.png',
                    data: payload.data,
                    tag: 'push-notification',
                    renotify: true
                };
                self.registration.showNotification(title, notificationOptions);
            }
        });
    }
};

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        firebaseConfig = event.data.config;
        console.log('[firebase-messaging-sw.js] Received config from client');
        initializeMessaging(firebaseConfig);
    }
    
    if (event.data && event.data.type === 'SHOW_SYSTEM_NOTIFICATION') {
        const title = event.data.title;
        const options = event.data.options || {};
        console.log('[firebase-messaging-sw.js] Manual trigger:', title);
        
        event.waitUntil(
            self.registration.showNotification(title, {
                body: options.body,
                icon: '/apple-icon.png',
                badge: '/apple-icon.png',
                data: options.data,
                tag: 'push-notification',
                renotify: true
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            const click_actions = event.notification.data?.click_action || '/';
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(click_actions) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(click_actions);
            }
        })
    );
});
