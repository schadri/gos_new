'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchToken, onMessageListener } from '@/lib/firebase'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

export function FCMProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const pathname = usePathname()

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
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setupFCM()
      }
    })
    
    // Foreground message listener
    onMessageListener(async (msg: any) => {
      if (msg) {
        // 1. Intelligent suppression
        const linkUrl = msg.data?.click_action || msg.fcm_options?.link;
        const senderId = msg.data?.sender_id;
        
        const { data: { user } } = await supabase.auth.getUser();

        // Skip if sender is this user
        if (senderId && user?.id === senderId) {
            return;
        }

        // Skip if user is already on the page (Normalize trailing slashes)
        const normalizedPath = pathname?.replace(/\/$/, '');
        const normalizedLink = linkUrl?.replace(/\/$/, '');
        
        if (normalizedLink && normalizedPath === normalizedLink) {
            return;
        }

        // Show UI Toast
        toast(msg.notification?.title || 'Nueva Notificación', {
          description: msg.notification?.body,
        })
      }
    })

    return () => {
        subscription.unsubscribe()
    }

  }, [supabase, pathname])

  return <>{children}</>
}
