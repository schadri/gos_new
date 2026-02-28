import { Button } from '@/components/ui/button'
import { Briefcase, Sparkles, MessageSquare, Heart, CheckCircle2 } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'match', title: '¡Nuevo Match! Eres el candidato ideal', desc: 'Tu perfil tiene un 95% de coincidencia con "Jefe de Cocina" en La Mar Cevichería. ¡No dejes pasar esta oportunidad!', time: 'Hace 2 horas', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', unread: true },
    { id: 2, type: 'message', title: 'Nuevo mensaje recibido', desc: 'La Mar Cevichería te ha enviado un mensaje sobre tu postulación.', time: 'Hace 3 horas', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', unread: true },
    { id: 3, type: 'app', title: 'Postulación Revisada', desc: 'Tu postulación para "Sous Chef" ha sido revisada por el empleador. Pronto se comunicarán contigo.', time: 'Ayer', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', unread: false },
    { id: 4, type: 'system', title: 'Perfil Incompleto', desc: 'Completa tu perfil al 100% subiendo tu CV para obtener más visibilidad y mejores matches.', time: 'Hace 3 días', icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', unread: false },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-4 font-medium text-xl">Mantente al tanto de tus matches y aplicaciones en tiempo real.</p>
        </div>
        <Button variant="outline" className="font-bold text-primary hover:bg-primary/10 transition-colors h-12 px-6 rounded-2xl border-primary/20 shadow-sm shrink-0">Marcar todas como leídas</Button>
      </div>

      <div className="space-y-6">
        {notifications.map(notif => (
          <div key={notif.id} className={`p-8 rounded-[2rem] border transition-all duration-300 flex flex-col sm:flex-row gap-6 cursor-pointer hover:-translate-y-1 ${notif.unread ? 'bg-background shadow-lg border-primary/30 ring-1 ring-primary/10' : 'bg-card border-border/50 hover:border-border shadow-sm'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${notif.bg} ${notif.color} border ${notif.border} shadow-sm`}>
              <notif.icon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                <h3 className={`text-2xl font-extrabold ${notif.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                  {notif.title}
                </h3>
                <span className="text-sm font-bold text-muted-foreground whitespace-nowrap bg-muted px-3 py-1 rounded-lg w-fit">{notif.time}</span>
              </div>
              <p className={`text-lg font-medium leading-relaxed ${notif.unread ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                {notif.desc}
              </p>
              
              <div className="mt-6 flex gap-4">
                {notif.type === 'match' && (
                  <Button className="h-12 px-8 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all">Ver Oferta</Button>
                )}
                {notif.type === 'message' && (
                  <Button variant="outline" className="h-12 px-8 rounded-xl font-bold text-base bg-background shadow-sm border-border/60 hover:bg-muted">Ir al Chat</Button>
                )}
              </div>
            </div>
            
            {notif.unread && (
              <div className="absolute top-8 right-8">
                <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.6)] animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
