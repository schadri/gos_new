'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Toaster } from "@/components/ui/sonner"

import { FCMProvider } from "@/components/providers/fcm-provider"
import { InstallPWA } from "@/components/shared/install-pwa"
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <FCMProvider>
        {children}
        <InstallPWA />
        <NotificationPermissionPrompt />
        <Toaster position="top-center" />
      </FCMProvider>
    </NextThemesProvider>
  )
}
