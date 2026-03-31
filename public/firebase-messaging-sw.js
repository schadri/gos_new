importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// 1. Registro inmediato de eventos básicos
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 2. Variables globales para mantener el estado
let messaging = null;

// 3. REGISTRO INICIAL OBLIGATORIO
// Registramos el click de notificación aquí afuera para que el navegador lo vea de entrada
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const click_action = event.notification.data?.click_action || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(click_action) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(click_action);
        })
    );
});

// 4. Manejo de mensajes para inicializar
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        const config = event.data.config;
        
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
            messaging = firebase.messaging();

            // Al usar la versión compat dentro de un evento asíncrono, 
            // asegúrate de que el SDK de Firebase registre el listener de push correctamente.
            messaging.onBackgroundMessage((payload) => {
                const title = payload.notification?.title || payload.data?.title || 'Nueva notificación';
                const notificationOptions = {
                    body: payload.notification?.body || payload.data?.body,
                    icon: '/apple-icon.png',
                    badge: '/apple-icon.png',
                    data: payload.data,
                };
                
                // Retornar la promesa para mantener vivo el SW
                return self.registration.showNotification(title, notificationOptions);
            });
        }
    }
    
    // Trigger manual para pruebas
    if (event.data && event.data.type === 'SHOW_SYSTEM_NOTIFICATION') {
        event.waitUntil(
            self.registration.showNotification(event.data.title, {
                body: event.data.options?.body,
                icon: '/apple-icon.png',
                data: event.data.options?.data,
            })
        );
    }
});
