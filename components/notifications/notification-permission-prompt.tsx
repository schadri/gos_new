'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchToken } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Show after 5 seconds to not overwhelm
        const timer = setTimeout(() => {
            setShow(true)
        }, 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleRequest = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        await fetchToken()
      }
      setShow(false)
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setShow(false)
    }
  }

  if (!mounted || !show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-24 md:bottom-10 left-4 right-4 md:left-auto md:right-10 md:max-w-xs z-[100]"
      >
        <div className="bg-primary text-primary-foreground rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2">
            <button onClick={() => setShow(false)} className="opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Bell className="h-6 w-6 animate-tada" />
            </div>
            <div>
              <h4 className="font-bold text-lg leading-tight">¿Deseas recibir avisos?</h4>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">Te avisaremos sobre mensajes nuevos y matches al instante.</p>
              <Button 
                onClick={handleRequest}
                className="mt-4 w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl shadow-md"
              >
                Habilitar Notificaciones
              </Button>
            </div>
          </div>
          <style jsx>{`
            @keyframes tada {
              0% { transform: scale(1); }
              10%, 20% { transform: scale(0.9) rotate(-3deg); }
              30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
              40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
              100% { transform: scale(1) rotate(0); }
            }
            .animate-tada {
              animation: tada 2s infinite;
            }
          `}</style>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
