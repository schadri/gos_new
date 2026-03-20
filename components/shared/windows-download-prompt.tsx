'use client'

import * as React from 'react'
import { Monitor, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function WindowsDownloadPrompt() {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    // 1. Check if Windows
    const isWindows = window.navigator.userAgent.includes('Win')
    
    // 2. Check if already in Tauri
    const isTauri = (window as any).__TAURI_METADATA__ || (window as any).__TAURI_INTERNALS__
    
    // 3. Check if PWA (Standalone)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches

    // 4. Check if dismissed session-wise
    const isDismissed = sessionStorage.getItem('dismiss-windows-download')

    if (isWindows && !isTauri && !isPWA && !isDismissed) {
      // Delay to not overwhelm immediately
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('dismiss-windows-download', 'true')
  }

  const downloadUrl = '/gos_0.1.0_x64-setup.exe' // ACTUALIZADO CON LINK REAL

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <div className="relative overflow-hidden rounded-[32px] bg-background/80 backdrop-blur-2xl border-2 border-primary/20 shadow-2xl shadow-primary/10 p-6 md:p-8">
            {/* Decorative background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary glow-primary">
                <Monitor className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-foreground">GOS para Windows</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Descargá nuestra aplicación de escritorio para una experiencia más rápida y notificaciones directas en tu PC.
                </p>
              </div>

              <div className="pt-2 w-full flex flex-col gap-3">
                <Button 
                  asChild
                  className="w-full h-12 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20"
                >
                  <a href={downloadUrl} download>
                    <Download className="h-5 w-5" />
                    Descargar Ahora
                  </a>
                </Button>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Versión estable v1.0.0
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
