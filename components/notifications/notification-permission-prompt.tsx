'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchToken, saveTokenToSupabase } from '@/lib/firebase'
import { createClient } from '@/lib/supabase/client'
import { sendTestNotification } from '@/app/actions/test-notification'
import { toast } from 'sonner'

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isGranted, setIsGranted] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => {
            setShow(true)
        }, 5000)
        return () => clearTimeout(timer)
      } else if (Notification.permission === 'granted') {
          setIsGranted(true)
      }
    }
  }, [])

  const handleRequest = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const token = await fetchToken()
        if (token) {
           await saveTokenToSupabase(token, supabase)
           setIsGranted(true)
           toast.success('¡Notificaciones habilitadas!')
        }
      } else {
          setShow(false)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    } finally {
        setLoading(false)
    }
  }

  const handleTest = async () => {
      setLoading(true)
      try {
          const res = await sendTestNotification()
          if (res.success) {
              toast.success(res.message)
          } else {
              toast.error(res.error)
          }
      } catch (err) {
          toast.error('Error al enviar la prueba')
      } finally {
          setLoading(false)
          // Hide after test
          setTimeout(() => setShow(false), 3000)
      }
  }

  if (!mounted || !show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-24 md:bottom-10 left-4 right-4 md:left-auto md:right-10 md:max-w-sm z-[100]"
      >
        <div className="bg-primary dark:bg-primary/90 text-primary-foreground rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group border border-white/10 backdrop-blur-md">
          {/* Decorative background element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="absolute top-0 right-0 p-3">
            <button 
              onClick={() => setShow(false)} 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-5 items-start relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl shadow-inner backdrop-blur-sm">
              <Bell className="h-7 w-7 animate-tada" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl leading-tight">
                {isGranted ? '¡Todo listo! 🎉' : '¿Deseas recibir avisos?'}
              </h4>
              <p className="text-sm opacity-90 mt-2 leading-relaxed font-medium">
                {isGranted 
                  ? 'Ya puedes recibir notificaciones de mensajes y matches.' 
                  : <>Te avisaremos sobre <span className="font-bold">mensajes nuevos</span> y <span className="font-bold">matches</span> al instante.</>}
              </p>
              
              {!isGranted ? (
                <Button 
                  onClick={handleRequest}
                  disabled={loading}
                  className="mt-5 w-full bg-white text-primary hover:bg-white/90 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all h-12 text-base active:scale-95"
                >
                  {loading ? 'Habilitando...' : 'Habilitar Notificaciones'}
                </Button>
              ) : (
                <Button 
                    onClick={handleTest}
                    disabled={loading}
                    className="mt-5 w-full bg-white/20 text-white hover:bg-white/30 border border-white/30 font-bold rounded-2xl shadow-lg transition-all h-12 text-base active:scale-95"
                >
                    {loading ? 'Enviando...' : 'Enviar Prueba'}
                </Button>
              )}
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
