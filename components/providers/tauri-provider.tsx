'use client'

import * as React from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export function TauriProvider({ children }: { children: React.ReactNode }) {
  const handledUrlRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!isTauri()) return

    const setup = async () => {
      // Dynamically import Tauri-only plugins to avoid Vercel build errors
      const { requestPermission, isPermissionGranted } = await import('@tauri-apps/plugin-notification')
      const { onOpenUrl, getCurrent } = await import('@tauri-apps/plugin-deep-link')

      // Setup notifications
      try {
        let permission = await isPermissionGranted()
        if (!permission) {
          const res = await requestPermission()
          permission = res === 'granted'
        }
        console.log('[Tauri] Notification Permission:', permission)
      } catch (err) {
        console.error('[Tauri] Failed to setup notifications:', err)
      }

      const handleUrl = (url: string) => {
        // Debounce: Avoid handling the exact same URL twice (e.g., from multiple listeners)
        if (handledUrlRef.current === url) return
        
        if (url.startsWith('gos://auth/callback')) {
          // If already on the callback page, do not redirect again to avoid loop
          if (window.location.pathname.startsWith('/auth/callback')) {
            console.log('[Tauri] Already on callback page, ignoring deep link to avoid reload loop.')
            return
          }

          console.log('[Tauri] Debounced Redirect to auth callback:', url)
          handledUrlRef.current = url
          window.location.href = `/auth/callback-client${new URL(url).search}`
        }
      }

      // 0. Custom Event Listener (Backup from Rust emit in single-instance)
      const unlistenEvent = listen<string[]>('deep-link-received', (event) => {
        console.log('[Tauri] Custom Deep Link Event received:', event.payload)
        event.payload.forEach(handleUrl)
      })

      // 1. Handle runtime links
      const unlisten = onOpenUrl((urls: string[]) => {
        console.log('[Tauri] Deep Link received (runtime):', urls)
        urls.forEach(handleUrl)
      })

      // 2. Handle initial launch links (cold start)
      try {
        const initialUrls = await getCurrent()
        const initialUrl = initialUrls && initialUrls.length > 0 ? initialUrls[0] : null
        if (initialUrl) {
          console.log('[Tauri] Initial Deep Link detected:', initialUrl)
          handleUrl(initialUrl)
        }
      } catch (err) {
        console.error('[Tauri] Failed to get initial URL:', err)
      }

      return () => {
        Promise.resolve(unlisten).then(f => f())
        Promise.resolve(unlistenEvent).then(f => f())
      }
    }

    setup()
  }, [])

  return <>{children}</>
}
