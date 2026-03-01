import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Building, Briefcase, Calendar, CheckCircle2, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MatchButton } from '@/components/employer/match-button'
import { ApplicantModal } from '@/components/employer/applicant-modal'

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch job details and verify ownership
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  if (job.created_by !== user.id) {
    redirect('/employer/dashboard')
  }

  // Fetch applications
  const { data: applications, error: appsError } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  let typedApplications = applications as any[] || []

  if (typedApplications.length > 0) {
    const applicantIds = typedApplications.map(app => app.applicant_id)
    
    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_photo, position, location, match_message, keywords, cv_url')
      .in('id', applicantIds)

    if (!profilesError && profiles) {
      typedApplications = typedApplications.map(app => {
        const profile = profiles.find((p: any) => p.id === app.applicant_id)
        return {
          ...app,
          profiles: profile || null
        }
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/employer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Dashboard
      </Link>

      <div className="bg-card w-full rounded-[2rem] p-8 border border-border/50 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-extrabold tracking-tight">{job.title}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{typedApplications.length} Postulantes</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium">
              <span className="flex items-center"><Building className="mr-1.5 h-4 w-4" /> {job.company}</span>
              <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4" /> {job.location || 'Remoto'}</span>
              <span className="flex items-center"><Briefcase className="mr-1.5 h-4 w-4" /> {job.contract_type}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {typedApplications.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/50 shadow-sm">
            <UserCircle2 className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">Aún no hay postulantes</h3>
            <p className="text-muted-foreground">Las personas que se postulen a tu oferta aparecerán aquí.</p>
          </div>
        ) : (
          typedApplications.map((app) => (
            <div key={app.id} className="bg-card p-6 sm:p-8 rounded-3xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{app.profiles?.full_name || 'Usuario Anónimo'}</h3>
                    <p className="text-lg text-muted-foreground font-medium">{app.profiles?.position?.[0] || 'Profesional'}</p>
                  </div>
                  {app.status === 'interview' && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 font-bold px-3 py-1">
                      Match Realizado
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
                  {app.profiles?.location && (
                    <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4" /> {app.profiles.location}</span>
                  )}
                  {app.years_experience != null && (
                    <span className="flex items-center"><Briefcase className="mr-1.5 h-4 w-4" /> {app.years_experience} años exp.</span>
                  )}
                  <span className="flex items-center"><Calendar className="mr-1.5 h-4 w-4" /> Postulado el {new Date(app.created_at).toLocaleDateString()}</span>
                </div>

                {app.profiles?.match_message && (
                  <div className="mb-6">
                    <p className="text-muted-foreground/90 line-clamp-3 leading-relaxed">{app.profiles.match_message}</p>
                  </div>
                )}

                {app.profiles?.keywords && app.profiles.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {app.profiles.keywords.map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="px-3 py-1 bg-muted/50 rounded-lg font-medium border-border/60">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
                <ApplicantModal profile={app.profiles} applicationDate={app.created_at} />
                <MatchButton  
                  applicationId={app.id} 
                  applicantId={app.applicant_id}
                  jobId={id} 
                  applicantName={app.profiles?.full_name} 
                  initialStatus={app.status} 
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
