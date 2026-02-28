import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Eye, Users, MessageSquare, TrendingUp, Sparkles, PlusCircle, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { JobActionsMenu } from '@/components/employer/job-actions-menu'



export default async function EmployerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch real profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const companyName = profile?.company_name || 'Mi Emprendimiento'

  // Fetch real jobs created by this employer
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const activeJobs = jobs || []

  const totalActiveJobs = activeJobs.filter(j => j.status === 'active').length
  const totalViews = activeJobs.reduce((acc, job) => acc + (job.views_count || 0), 0)
  const totalApplicants = activeJobs.reduce((acc, job) => acc + (job.applications_count || 0), 0)
  const totalMatches = activeJobs.reduce((acc, job) => acc + (job.contacted_count || 0), 0)

  const dynamicMetrics = [
    { label: 'Ofertas Activas', value: totalActiveJobs.toString(), icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Vistas Totales', value: totalViews.toString(), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Postulantes', value: totalApplicants.toString(), icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Chats / Matches', value: totalMatches.toString(), icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  // Fetch real notifications for recent activity
  const { data: notificationsData } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4)

  const notifications = notificationsData || []

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `Hace ${diff} segundos`
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Panel de Control: {companyName}</h1>
          <p className="text-muted-foreground mt-2 font-medium">Gestiona tus ofertas y evalúa los matches de talento.</p>
        </div>
        <Button size="lg" className="rounded-xl h-12 shadow-md hover:shadow-lg transition-all font-bold gap-2" asChild>
          <Link href="/employer/post-job"><PlusCircle className="h-5 w-5" /> Nueva Oferta</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {dynamicMetrics.map((item, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className={`p-3 rounded-2xl w-fit ${item.bg} mb-4`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-3xl font-extrabold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Mis Publicaciones</h2>
          </div>
          
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <div className="p-10 text-center bg-muted/20 border rounded-3xl border-dashed">
                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-bold mb-2">No tienes ofertas publicadas</h3>
                <p className="text-muted-foreground text-sm mb-6">Aún no has creado ninguna publicación de trabajo. ¡Comienza ahora para encontrar al talento ideal!</p>
                <Button asChild>
                  <Link href="/employer/post-job">Publicar mi primer Empleo</Link>
                </Button>
              </div>
            ) : (
              activeJobs.map(job => (
                <div key={job.id} className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                      {job.status === 'active' ? (
                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-transparent">Activa</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">Borrador</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Publicado: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 sm:gap-10">
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center"><Eye className="h-4 w-4 mr-1.5" /> {job.views_count || 0} vistas</span>
                      <span className="text-sm font-semibold text-muted-foreground flex items-center"><Users className="h-4 w-4 mr-1.5" /> {job.applications_count || 0} aplic.</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="px-3 py-1.5 bg-primary/10 text-primary border-primary/20 font-bold shadow-sm">
                        <Sparkles className="h-3 w-3 mr-1" /> {job.contacted_count || 0} Matches
                      </Badge>
                      <JobActionsMenu jobId={job.id} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/15 shadow-sm text-center">
            <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg border border-primary/20 mb-6">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Impulsa tus ofertas</h3>
            <p className="text-muted-foreground font-medium mb-6 text-sm">
              Destaca tus publicaciones para aparecer primero en las búsquedas y notificar a los mejores candidatos al instante.
            </p>
            <Button className="w-full h-12 rounded-xl font-bold shadow-md hover:shadow-lg transition-shadow">Destacar una Oferta</Button>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-t border-border/30 pt-6">
                  <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No hay actividad reciente aún.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="flex gap-4 items-start relative pb-4 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{notif.title || notif.message}</p>
                      {notif.title && <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>}
                      <p className="text-xs font-semibold text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <Button variant="ghost" className="w-full mt-4 text-primary font-bold hover:bg-primary/10 transition-colors" asChild>
                <Link href="/notifications">Ver todas las notificaciones</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
