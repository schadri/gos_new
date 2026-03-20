'use client'

import * as React from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { requestPermission, isPermissionGranted } from '@tauri-apps/plugin-notification'
import { onOpenUrl, getCurrent } from '@tauri-apps/plugin-deep-link'
import { listen } from '@tauri-apps/api/event'

export function TauriProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (isTauri()) {
      const setupTauriNotifications = async () => {
        try {
          let permission = await isPermissionGranted()
          if (!permission) {
            const permissionRes = await requestPermission()
            permission = permissionRes === 'granted'
          }
          console.log('[Tauri] Notification Permission:', permission)
        } catch (err) {
          console.error('[Tauri] Failed to setup notifications:', err)
        }
      }

      setupTauriNotifications()

      // 0. Custom Event Listener (Backup)
      const unlistenEvent = listen<string[]>('deep-link-received', (event) => {
        console.log('[Tauri] Custom Deep Link Event received:', event.payload)
        event.payload.forEach((url) => {
          if (url.startsWith('gos://auth/callback')) {
            window.location.href = `/auth/callback-client${new URL(url).search}`
          }
        })
      })

      // 1. Handle runtime links
      const unlisten = onOpenUrl((urls) => {
        console.log('[Tauri] Deep Link received (runtime):', urls)
        urls.forEach((url) => {
          if (url.startsWith('gos://auth/callback')) {
            const urlObj = new URL(url)
            console.log('[Tauri] Redirecting to auth callback:', urlObj.search)
            window.location.href = `/auth/callback-client${urlObj.search}`
          }
        })
      })

      // 2. Handle initial launch links (cold start)
      const checkInitialUrl = async () => {
        try {
          const initialUrls = await getCurrent()
          const initialUrl = initialUrls && initialUrls.length > 0 ? initialUrls[0] : null
          
          if (initialUrl && initialUrl.startsWith('gos://auth/callback')) {
            console.log('[Tauri] Initial Deep Link detected:', initialUrl)
            const urlObj = new URL(initialUrl)
            window.location.href = `/auth/callback-client${urlObj.search}`
          }
        } catch (err) {
          console.error('[Tauri] Failed to get initial URL:', err)
        }
      }

      checkInitialUrl()

      return () => {
        unlisten.then(f => f())
        unlistenEvent.then(f => f())
      }
    }
  }, [])

  return <>{children}</>
}
