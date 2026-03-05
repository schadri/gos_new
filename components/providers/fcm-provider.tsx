'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchToken, onMessageListener } from '@/lib/firebase'
import { toast } from 'sonner'

export function FCMProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  useEffect(() => {
    // 1. Service Worker registration and config injection
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      const missing: string[] = [];
      if (!config.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
      if (!config.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
      if (!config.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

      const isConfigValid = missing.length === 0;

      const sendConfig = (worker: ServiceWorker) => {
        if (!isConfigValid) {
          console.warn('FCMProvider: Missing environment variables for SW:', missing.join(", "));
          return;
        }
        worker.postMessage({
          type: 'FIREBASE_CONFIG',
          config
        })
      }

      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          if (registration.active) {
            sendConfig(registration.active)
          }
          
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'activated') {
                  sendConfig(installingWorker)
                }
              })
            }
          })
        })
        .catch(err => console.error('Service Worker registration failed:', err))
    }

    const setupFCM = async () => {
      try {
        if (!('serviceWorker' in navigator)) return;
        
        const registration = await navigator.serviceWorker.ready;
        const token = await fetchToken(registration)
        
        if (token) {
          console.log('FCM Token:', token)
          
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Update fcm_token in profiles table
            const { error } = await (supabase as any)
              .from('profiles')
              .update({ fcm_token: token })
              .eq('id', user.id)
            
            if (error) {
              console.error('Error updating FCM token in Supabase:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error setting up FCM:', error)
      }
    }

    setupFCM()
    
    // 3. Listen for auth changes to save token when user logs in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setupFCM()
      }
    })
    
    // Foreground message listener
    onMessageListener((msg: any) => {
      if (msg) {
        // 1. Show UI Toast (current behavior)
        toast(msg.notification?.title || 'Nueva Notificación', {
          description: msg.notification?.body,
        })

        // 2. Force System Notification via Service Worker
        if ('serviceWorker' in navigator) {
            console.log('FCMProvider: Attempting to force system notification...');
            
            const triggerSW = (worker: ServiceWorker) => {
                console.log('FCMProvider: Sending SHOW_SYSTEM_NOTIFICATION to SW');
                worker.postMessage({
                    type: 'SHOW_SYSTEM_NOTIFICATION',
                    title: msg.notification?.title || msg.data?.title || 'Nueva Notificación',
                    options: {
                        body: msg.notification?.body || msg.data?.body,
                        data: msg.data
                    }
                });
            }

            if (navigator.serviceWorker.controller) {
                triggerSW(navigator.serviceWorker.controller);
            } else {
                // Aggressive fallback to find any worker
                navigator.serviceWorker.getRegistration().then(reg => {
                    const worker = reg?.active || reg?.waiting || reg?.installing;
                    if (worker) triggerSW(worker);
                    else console.warn('FCMProvider: No Service Worker found at all');
                });
            }
        }
      }
    })

    return () => {
        subscription.unsubscribe()
    }

  }, [supabase])

  return <>{children}</>
}
