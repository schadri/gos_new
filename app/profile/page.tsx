import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { User, MapPin, Briefcase, Sparkles, Settings, FileText, Bookmark, CheckCircle2 } from 'lucide-react'

export default function TalentProfile() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm text-center relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 hover:bg-muted">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <div className="w-28 h-28 mx-auto bg-muted rounded-full border-4 border-background shadow-lg mb-6 flex items-center justify-center overflow-hidden">
              <User className="h-12 w-12 text-muted-foreground/50" />
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight">Juan Pérez</h1>
            <p className="text-muted-foreground font-medium mt-1 mb-4 flex items-center justify-center"><MapPin className="h-4 w-4 mr-1 text-primary" /> Buenos Aires, Palermo</p>
            
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-transparent font-bold">Activamente buscando</Badge>
            
            <div className="mt-8 pt-6 border-t border-border/50 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">Perfil completado</span>
                <span className="text-sm font-bold text-primary">85%</span>
              </div>
              <Progress value={85} className="h-2.5 bg-muted/40" />
              <p className="text-xs text-muted-foreground mt-3 font-medium">Sube tu CV para alcanzar el 100% y mejorar tus matches.</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Puestos Deseados</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-background">Jefe de Cocina</Badge>
              <Badge variant="outline" className="bg-background">Sous Chef</Badge>
              <Badge variant="outline" className="bg-background">Cocinero de línea</Badge>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-muted">Pescados</Badge>
              <Badge variant="secondary" className="bg-muted">Costos</Badge>
              <Badge variant="secondary" className="bg-muted">Liderazgo</Badge>
              <Badge variant="secondary" className="bg-muted">Inventarios</Badge>
            </div>
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-primary">
                  <Sparkles className="h-6 w-6" /> ¡Tienes 3 nuevos matches!
                </h2>
                <p className="text-muted-foreground font-medium text-sm">Basado en tu última actualización de perfil y habilidades.</p>
              </div>
              <Button className="shrink-0 font-bold rounded-xl shadow-md">Ver Matches</Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" /> Mis Postulaciones
              </h2>
              <Button variant="ghost" size="sm" className="font-medium">Ver historial</Button>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Jefe de Cocina', company: 'La Mar', status: 'En revisión', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 },
                { title: 'Sous Chef', company: 'Don Julio', status: 'Entrevista', color: 'text-green-500', bg: 'bg-green-500/10', icon: Briefcase },
                { title: 'Cocinero de partida', company: 'Chila', status: 'Enviada', color: 'text-muted-foreground', bg: 'bg-muted', icon: FileText }
              ].map((app, i) => (
                <div key={i} className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted border flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-sm">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg">{app.title}</h4>
                      <p className="text-sm font-medium text-muted-foreground">{app.company} • Hace {i+1} días</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl flex items-center text-sm font-bold ${app.bg} ${app.color}`}>
                    <app.icon className="h-4 w-4 mr-2" />
                    {app.status}
                  </div>
                </div>
              ))}
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
