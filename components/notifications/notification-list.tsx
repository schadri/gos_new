'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Briefcase, Sparkles, MessageSquare, CheckCircle2, Bell, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

export function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const supabase = createClient()

  const hasUnread = notifications?.some(n => !n.is_read)

  const getIconForType = (type: string) => {
    switch (type) {
      case 'match': return { icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
      case 'message': return { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
      case 'application_update': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' }
      default: return { icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' }
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error al eliminar la notificación')
      // Revert if error
      setNotifications(initialNotifications)
    }
  }

  const handleClearAll = async () => {
    const currentNotifications = [...notifications]
    setNotifications([])
    
    // We get the user ID from the first notification assuming they are all from the same user
    if (currentNotifications.length > 0) {
      const userId = currentNotifications[0].user_id
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        
      if (error) {
        console.error('Error clearing notifications:', error)
        toast.error('Error al limpiar las notificaciones')
        setNotifications(currentNotifications)
      } else {
        toast.success('Todas las notificaciones eliminadas')
      }
    }
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="bg-card p-12 rounded-[2rem] border border-dashed border-border flex flex-col items-center justify-center text-center mt-8">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <Bell className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-2xl font-extrabold mb-3">No hay notificaciones</h3>
        <p className="text-muted-foreground font-medium text-lg max-w-md">
          Aún no tienes notificaciones recientes. Aquí aparecerán tus matches, mensajes nuevos y actualizaciones.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button 
          variant="ghost" 
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-destructive flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Limpiar todo</span>
        </Button>
      </div>

      <div className="space-y-6 overflow-hidden">
        <AnimatePresence>
          {notifications.map(notif => {
            const { icon: Icon, color, bg, border } = getIconForType(notif.type)
            const isUnread = !notif.is_read
            const dateStr = new Date(notif.created_at).toLocaleDateString()

            return (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                onDragEnd={(e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
                  if (offset.x < -80 || velocity.x < -500) {
                    handleDelete(notif.id)
                  }
                }}
                className={`relative w-full rounded-[2rem] touch-pan-y`}
              >
                {/* Background Delete Action - Revealed on swipe */}
                <div className="absolute inset-0 bg-destructive rounded-[2rem] flex items-center justify-end px-8 z-0">
                  <span className="text-white font-bold flex items-center gap-2">
                    <Trash2 className="h-6 w-6" /> Eliminar
                  </span>
                </div>

                {/* Foreground Card */}
                <motion.div 
                  className={`relative z-10 p-6 sm:p-8 rounded-[2rem] border flex flex-col sm:flex-row gap-5 sm:gap-6 cursor-pointer hover:-translate-y-1 w-full ${isUnread ? 'bg-background shadow-lg border-primary/30 ring-1 ring-primary/10' : 'bg-card border-border/50 hover:border-border shadow-sm'}`}
                  whileDrag={{ scale: 0.98, cursor: 'grabbing' }}
                  dragSnapToOrigin={true}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-8 w-8 rounded-full z-20"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notif.id)
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${bg} ${color} border ${border} shadow-sm`}>
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div className="flex-1 pr-10 sm:pr-12">
                    <div className="flex flex-row justify-between items-start mb-3 gap-2">
                      <h3 className={`text-lg sm:text-2xl font-extrabold flex items-center gap-2 ${isUnread ? 'text-foreground' : 'text-foreground/80'} leading-tight`}>
                        {notif.title}
                        {isUnread && (
                          <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)] animate-pulse shrink-0"></div>
                        )}
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-md sm:rounded-lg shrink-0 mt-1">{dateStr}</span>
                    </div>
                    <p className={`text-base sm:text-lg font-medium leading-relaxed ${isUnread ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                      {notif.description}
                    </p>
                    
                    {notif.link_url && (
                      <div className="mt-5 sm:mt-6 flex flex-wrap gap-3 sm:gap-4">
                        {notif.type === 'match' && (
                          <Button asChild className="h-10 sm:h-12 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all" onClick={(e) => e.stopPropagation()}>
                            <Link href={notif.link_url}>Ir a Mis Postulaciones</Link>
                          </Button>
                        )}
                        {notif.type === 'message' && (
                          <Button asChild variant="outline" className="h-10 sm:h-12 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base bg-background shadow-sm border-border/60 hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                            <Link href={notif.link_url}>Ir al Chat</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
