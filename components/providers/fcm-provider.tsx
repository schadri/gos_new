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

      const isConfigValid = config.apiKey && config.projectId && config.appId;

      const sendConfig = (worker: ServiceWorker) => {
        if (!isConfigValid) {
          console.warn('FCMProvider: Skipping SW config injection because required environment variables are missing.');
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
        const token = await fetchToken()
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
    
    // Foreground message listener
    const unsubscribe = onMessageListener().then((msg: any) => {
      if (msg) {
        toast(msg.notification?.title || 'Nueva Notificación', {
          description: msg.notification?.body,
        })
      }
    }).catch(err => console.error('Foreground message listener error:', err))

  }, [supabase])

  return <>{children}</>
}
