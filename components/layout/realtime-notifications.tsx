'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'

export function RealtimeNotifications({ userId }: { userId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [supabase] = React.useState(() => createClient())

  React.useEffect(() => {
    if (!userId) return

    const channelName = `public:notifications:user_id=eq.${userId}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const notif = payload.new
        
        toast(notif.title, {
          description: notif.description,
          action: notif.link_url ? {
            label: 'Ver',
            onClick: () => router.push(notif.link_url)
          } : undefined,
          duration: 5000,
        })
        
        // Refresh the notifications page entirely if they are currently viewing it
        if (pathname === '/notifications') {
          router.refresh()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, pathname, router])

  return null
}
