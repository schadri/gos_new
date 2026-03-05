'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchToken, onMessageListener } from '@/lib/firebase'
import { toast } from 'sonner'

export function FCMProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  useEffect(() => {
    const setupFCM = async () => {
      try {
        const token = await fetchToken()
        if (token) {
          console.log('FCM Token:', token)
          
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Update fcm_token in profiles table
            const { error } = await supabase
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
