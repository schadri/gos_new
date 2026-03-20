import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, Sparkles, TrendingUp, UserCheck, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts
  const { count: totalTalents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'TALENT')

  const { count: totalEmployers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'BUSINESS')

  const { count: activeJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalApplications } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })

  const stats = [
    { label: 'Postulantes', value: totalTalents || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Emprendedores', value: totalEmployers || 0, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Ofertas Activas', value: activeJobs || 0, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Postulaciones', value: totalApplications || 0, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Panel Administrativo</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">Resumen global de la actividad en GOS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-4xl font-black">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Salud de la Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Base de Usuarios</p>
                    <p className="text-xs text-muted-foreground">Registros totales en crecimiento</p>
                  </div>
                </div>
                <span className="font-bold text-green-500">+12%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Moderación Pendiente</p>
                    <p className="text-xs text-muted-foreground">Nuevas ofertas a revisar</p>
                  </div>
                </div>
                <span className="font-bold text-orange-500">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-8 rounded-3xl bg-primary text-primary-foreground flex flex-col justify-between shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Modo Administrador</h3>
            <p className="text-primary-foreground/80 font-medium">Tienes acceso total a la gestión de datos. Toda acción de borrado o edición es permanente.</p>
          </div>
          <div className="mt-8 relative z-10">
             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold">
               <ShieldCheck className="h-4 w-4" /> Privilegios Activos
             </div>
          </div>
          <ShieldCheck className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12" />
        </div>
      </div>
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
