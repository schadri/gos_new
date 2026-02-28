import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { User, MapPin, Briefcase, Sparkles, Settings, FileText, Bookmark, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'
import { EditProfileModal } from '@/components/profile/edit-profile-modal'

export default async function TalentProfile() {
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

  const fullName = profile?.full_name || 'Usuario Nuevo'
  const location = profile?.location || 'Ubicación no especificada'
  const positions = profile?.position || []
  const skills = profile?.keywords || []
  const photoUrl = profile?.profile_photo

  // Fetch real applications
  const { data: applications } = await supabase
    .from('job_applications')
    .select(`
      id,
      status,
      created_at,
      jobs!inner (
        title,
        company
      )
    `)
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })

  // Determine completion percentage roughly
  let completion = 25 // base registration
  if (profile?.full_name) completion += 25
  if (profile?.location) completion += 10
  if (positions.length > 0) completion += 10
  if (skills.length > 0) completion += 10
  if (profile?.cv_url) completion += 20
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm text-center relative">
            <EditProfileModal 
              initialName={fullName}
              initialPhoto={photoUrl}
              initialCv={profile?.cv_url}
              initialKeywords={skills}
            />
            
            <div className="w-28 h-28 mx-auto bg-muted rounded-full border-4 border-background shadow-lg mb-6 flex items-center justify-center overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage src={photoUrl || ''} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-muted">
                  <User className="h-12 w-12 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground font-medium mt-1 mb-4 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1 text-primary" /> {location}
            </p>
            
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-transparent font-bold">Activamente buscando</Badge>
            
            <div className="mt-8 pt-6 border-t border-border/50 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">Perfil completado</span>
                <span className="text-sm font-bold text-primary">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2.5 bg-muted/40" />
              <p className="text-xs text-muted-foreground mt-3 font-medium">Sube tu CV para alcanzar el 100% y mejorar tus matches.</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Puestos Deseados</h3>
            <div className="flex flex-wrap gap-2">
              {positions.length > 0 ? positions.map((pos: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-background">{pos}</Badge>
              )) : (
                <span className="text-sm text-muted-foreground">No especificado</span>
              )}
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((skill: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-muted">{skill}</Badge>
              )) : (
                <span className="text-sm text-muted-foreground">Ninguna cargada</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" /> Mis Postulaciones
              </h2>
              <Button variant="ghost" size="sm" className="font-medium">Ver historial</Button>
            </div>

            <div className="space-y-4">
              {applications && applications.length > 0 ? (
                applications.map((app: any) => {
                  let statusText = 'Enviada'
                  let statusColor = 'text-muted-foreground'
                  let statusBg = 'bg-muted'
                  let StatusIcon = FileText
                  
                  if (app.status === 'reviewed') {
                    statusText = 'En revisión'
                    statusColor = 'text-blue-500'
                    statusBg = 'bg-blue-500/10'
                    StatusIcon = CheckCircle2
                  } else if (app.status === 'interview') {
                    statusText = 'Entrevista'
                    statusColor = 'text-green-500'
                    statusBg = 'bg-green-500/10'
                    StatusIcon = Briefcase
                  } else if (app.status === 'rejected') {
                    statusText = 'No seleccionado'
                    statusColor = 'text-red-500'
                    statusBg = 'bg-red-500/10'
                    StatusIcon = XCircle
                  } else if (app.status === 'pending') {
                    statusText = 'Pendiente'
                    statusColor = 'text-yellow-600'
                    statusBg = 'bg-yellow-500/10'
                    StatusIcon = Clock
                  }

                  const date = new Date(app.created_at).toLocaleDateString()

                  return (
                    <div key={app.id} className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted border flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-sm">
                          {app.jobs?.company?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-lg">{app.jobs?.title}</h4>
                          <p className="text-sm font-medium text-muted-foreground">{app.jobs?.company} • {date}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl flex items-center text-sm font-bold ${statusBg} ${statusColor}`}>
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {statusText}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="bg-card p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/60 mb-4" />
                  <h4 className="font-bold text-lg mb-2">Aún no tienes postulaciones</h4>
                  <p className="text-muted-foreground font-medium text-sm mb-6 max-w-sm">
                    Explora las ofertas disponibles y comienza a postularte para encontrar tu próximo empleo.
                  </p>
                  <Button asChild className="rounded-xl font-bold shadow-sm">
                    <Link href="/jobs">Buscar Empleos</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
              <Bookmark className="h-5 w-5" /> Trabajos Guardados
            </h2>
            <div className="bg-card p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-muted/40 rounded-full mb-4">
                <Bookmark className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h4 className="font-bold text-lg mb-2">No tienes trabajos guardados</h4>
              <p className="text-muted-foreground font-medium text-sm mb-6 max-w-sm">
                Explora la bolsa de trabajo y guarda las oportunidades que te interesen para postularte más tarde.
              </p>
              <Button asChild className="rounded-xl font-bold shadow-sm">
                <Link href="/jobs">Explorar Empleos</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
