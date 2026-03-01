import { Button } from '@/components/ui/button'
import { Briefcase, Sparkles, MessageSquare, Heart, CheckCircle2, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const hasUnread = notifications?.some(n => !n.is_read)

  const getIconForType = (type: string) => {
    switch (type) {
      case 'match': return { icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
      case 'message': return { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
      case 'application_update': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' }
      default: return { icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-4 font-medium text-xl">Mantente al tanto de tus matches y aplicaciones en tiempo real.</p>
        </div>
      </div>

      <div className="space-y-6">
        {notifications && notifications.length > 0 ? (
          notifications.map(notif => {
            const { icon: Icon, color, bg, border } = getIconForType(notif.type)
            const isUnread = !notif.is_read
            const dateStr = new Date(notif.created_at).toLocaleDateString()

            return (
              <div key={notif.id} className={`p-8 rounded-[2rem] border transition-all duration-300 flex flex-col sm:flex-row gap-6 cursor-pointer hover:-translate-y-1 ${isUnread ? 'bg-background shadow-lg border-primary/30 ring-1 ring-primary/10' : 'bg-card border-border/50 hover:border-border shadow-sm'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${bg} ${color} border ${border} shadow-sm`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <h3 className={`text-2xl font-extrabold ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-sm font-bold text-muted-foreground whitespace-nowrap bg-muted px-3 py-1 rounded-lg w-fit">{dateStr}</span>
                  </div>
                  <p className={`text-lg font-medium leading-relaxed ${isUnread ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {notif.description}
                  </p>
                  
                  {notif.link_url && (
                    <div className="mt-6 flex gap-4">
                      {notif.type === 'match' && (
                        <Button asChild className="h-12 px-8 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all">
                          <Link href={notif.link_url}>Ir a Mis Postulaciones</Link>
                        </Button>
                      )}
                      {notif.type === 'message' && (
                        <Button asChild variant="outline" className="h-12 px-8 rounded-xl font-bold text-base bg-background shadow-sm border-border/60 hover:bg-muted">
                          <Link href={notif.link_url}>Ir al Chat</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {isUnread && (
                  <div className="absolute top-8 right-8">
                    <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.6)] animate-pulse"></div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="bg-card p-12 rounded-[2rem] border border-dashed border-border flex flex-col items-center justify-center text-center mt-8">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-extrabold mb-3">No hay notificaciones</h3>
            <p className="text-muted-foreground font-medium text-lg max-w-md">
              Aún no tienes notificaciones recientes. Aquí aparecerán tus matches, mensajes nuevos y actualizaciones.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
