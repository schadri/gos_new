import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Search, ExternalLink, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row']

export default async function AdminJobsPage() {
  const supabase = await createClient()
  const { data: jobs } = await (supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false }) as any) as { data: Job[] | null }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Gestión de Empleos</h1>
          <p className="text-muted-foreground mt-1 font-medium">Vigila y administra todas las publicaciones de la plataforma.</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary font-bold">
          {jobs?.length || 0} Ofertas Totales
        </Badge>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden text-sm">
        <div className="bg-muted/30 p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-muted-foreground px-2">
                <Search className="h-4 w-4" /> Buscar ofertas...
            </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground border-b text-xs">Puesto / Empresa</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground border-b text-xs">Estado</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground border-b text-xs">Métricas</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground border-b text-xs">Fecha</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground border-b text-xs text-right text-xs">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {jobs?.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="font-bold text-foreground leading-none mb-1.5">{job.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          {job.company} • <MapPin className="h-3 w-3" /> {job.location || 'Remoto'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === 'active' ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Publicado</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-xs font-bold text-muted-foreground">
                        <span title="Vistas">👁️ {job.views_count || 0}</span>
                        <span title="Postulaciones">👤 {job.applications_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/jobs/${job.id}`} className="p-2 inline-flex items-center justify-center rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all">
                          <ExternalLink className="h-4 w-4" />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
