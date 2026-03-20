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
      }, async (payload) => {
        const notif = payload.new
        
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
=======
>>>>>>> dbc8bada2f9154d5b22264a21e429dfbc67edf1c
        // Normalize paths for comparison
        const normalizedPath = pathname?.replace(/\/$/, '');
        const normalizedLink = notif.link_url?.replace(/\/$/, '');
        
<<<<<<< HEAD
        // If user is already on the page
        if (normalizedPath === normalizedLink) {
=======
        // If user is already on the page or is the sender (if we have sender_id)
        if (normalizedPath === normalizedLink || (notif.sender_id && notif.sender_id === userId)) {
>>>>>>> dbc8bada2f9154d5b22264a21e429dfbc67edf1c
          const { markAsRead } = await import('@/app/actions/notifications')
          await markAsRead(notif.id)
          return
        }

<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> dbc8bada2f9154d5b22264a21e429dfbc67edf1c
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
