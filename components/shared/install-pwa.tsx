'use client'

import React, { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
      return
    }

    let timer: NodeJS.Timeout;
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      
      // Delay showing our custom prompt slightly for better UX
      timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('PWA was installed')
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the native install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!mounted || isInstalled || !showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
      >
        <div className="bg-card border border-border/50 shadow-2xl rounded-3xl p-5 flex items-center gap-4 backdrop-blur-xl bg-card/95">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="h-7 w-7 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-foreground text-sm md:text-base">Instalar GOS App</h4>
            <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">
              Instala nuestra app para recibir notificaciones y acceder más rápido.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -top-2 -right-2 bg-background border h-7 w-7 rounded-full shadow-sm hover:bg-muted"
                onClick={() => setShowPrompt(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              className="rounded-xl px-4 font-bold shadow-md hover:shadow-lg transition-all"
              onClick={handleInstallClick}
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
