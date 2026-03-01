  import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Clock, Calendar, CheckCircle2, Building, ArrowLeft, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ApplyButton } from '@/components/jobs/apply-button'

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  // Await params in next 15
  const resolvedParams = await params

  // Fetch the specific job
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !job) {
    notFound()
  }

  // Get current session
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if they are an employer
  let isEmployer = false
  let hasApplied = false

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', user.id).single()
    isEmployer = profile?.user_type === 'BUSINESS' || user.user_metadata?.role === 'employer'

    if (!isEmployer) {
      const { data: appData } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('applicant_id', user.id)
        .single()
      
      hasApplied = !!appData
    }
  }

  // Format mapping
  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `Hace ${diff} segundos`
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

  const getContractLabel = (type: string | null) => {
    if (!type) return 'A convenir'
    const map: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'freelance': 'Freelance',
      'temporary': 'Eventual / Temporada'
    }
    return map[type] || type
  }

  const getExperienceLabel = (exp: string | null) => {
    if (!exp) return 'A convenir'
    return exp.includes('años') ? exp : `${exp} años`
  }

  const keywords = job.keywords || []
  const companyName = job.company || 'Empresa Confidencial'
  const location = job.location || 'Ubicación Remota / A convenir'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      <Link href="/jobs" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a los resultados
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-8 sm:p-10 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex items-start justify-between gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-background border flex items-center justify-center flex-shrink-0 text-foreground font-extrabold text-3xl sm:text-4xl shadow-sm">
                {companyName.charAt(0)}
              </div>
              <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:text-primary hover:border-primary/50 transition-colors border-border/50 bg-background">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">{job.title}</h1>
              <div className="flex items-center text-muted-foreground text-lg font-medium bg-muted/30 w-fit px-4 py-1.5 rounded-full border border-border/40">
                <Building className="h-5 w-5 mr-2" />
                <span className="text-foreground font-semibold">{companyName}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-10">
              <Badge variant="secondary" className="px-5 py-2.5 font-bold text-sm rounded-xl bg-background border border-border/50 shadow-sm text-foreground"><MapPin className="h-4 w-4 mr-2 text-primary" /> {location}</Badge>
              <Badge variant="secondary" className="px-5 py-2.5 font-bold text-sm rounded-xl bg-background border border-border/50 shadow-sm text-foreground"><Briefcase className="h-4 w-4 mr-2 text-primary" /> {getContractLabel(job.contract_type)}</Badge>
              <Badge variant="secondary" className="px-5 py-2.5 font-bold text-sm rounded-xl bg-background border border-border/50 shadow-sm text-foreground"><Clock className="h-4 w-4 mr-2 text-primary" /> {getExperienceLabel(job.experience_required)}</Badge>
            </div>
          </div>

          <div className="space-y-10 p-8 sm:p-10 bg-card rounded-3xl border border-border/50 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center"><CheckCircle2 className="mr-3 h-6 w-6 text-primary" /> Descripción del Puesto</h2>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium text-lg">
                {job.description || 'No se proporcionó una descripción para este puesto.'}
              </div>
            </div>

            {keywords.length > 0 && (
              <>
                <div className="h-px bg-border/60"></div>
                <div>
                  <h2 className="text-xl font-bold mb-5">Habilidades Clave (Keywords)</h2>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="px-4 py-2 text-sm font-semibold bg-primary/5 hover:bg-primary/10 border-primary/20 text-foreground rounded-xl transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl shadow-sm space-y-8 sticky top-28">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-sm font-medium bg-background/60 p-4 rounded-xl border border-border/50">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  <span>Publicado:</span>
                </div>
                <span className="text-foreground font-bold">{timeAgo(job.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm font-medium bg-background/60 p-4 rounded-xl border border-border/50">
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                  <span>Postulantes:</span>
                </div>
                <span className="text-foreground font-bold">{job.applications_count || 0}</span>
              </div>
            </div>

            <div className="pt-2">
              <ApplyButton 
                jobId={job.id} 
                userId={user?.id} 
                isEmployer={isEmployer} 
                hasApplied={hasApplied} 
              />
              <p className="text-xs text-center text-muted-foreground font-medium mt-4 leading-relaxed">
                Al postularte, el creador de la oferta podrá ver tu perfil y CV publicado de manera inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>
      <JobViewTracker jobId={job.id} />
    </div>
  )
}

function JobViewTracker({ jobId }: { jobId: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          fetch('/api/jobs/${jobId}/view', { method: 'POST', keepalive: true }).catch(console.error);
        `
      }}
    />
  )
}
