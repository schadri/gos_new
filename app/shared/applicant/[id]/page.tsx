import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Briefcase, UserCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SharedApplicantProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the applicant's profile by ID.
  // Note: We deliberately exclude cv_url here, even though RLS might protect it, 
  // just as an extra layer of structural security for the shared view.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, profile_photo, position, location, match_message, keywords')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Calculate experience years from job_applications if available
  // To avoid a big heavy query, we might just fetch the most recent application of this user 
  // to get their claimed years_experience
  const { data: latestApp } = await supabase
    .from('job_applications')
    .select('years_experience')
    .eq('applicant_id', profile.id)
    .not('years_experience', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  const experienceYears = latestApp?.years_experience

  return (
    <div className="min-h-screen bg-muted/20 pb-16 flex flex-col">
      

      {/* Profile Card */}
      <main className="flex-1 container mx-auto px-4 pt-12 mt-4 max-w-2xl">
        <div className="bg-card rounded-[2rem] p-0 overflow-hidden border border-border/60 shadow-md">
          <div className="bg-primary/5 p-8 border-b border-border/50 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {profile.profile_photo ? (
                  <img src={getAvatarUrl(profile.profile_photo) || ''} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-12 h-12 text-primary/60" />
                )}
              </div>
              <div className="mt-2 sm:mt-0 flex-1">
                <h1 className="text-3xl sm:text-2xl font-bold mb-1">{profile.full_name || 'Candidato'}</h1>
                <p className="text-xl sm:text-lg text-muted-foreground font-medium">{profile.position?.[0] || 'Profesional'}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.location && (
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/40">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-0.5">Ubicación</p>
                    <p className="text-sm font-semibold">{profile.location}</p>
                  </div>
                </div>
              )}
              {experienceYears != null && (
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/40">
                  <Briefcase className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-0.5">Experiencia</p>
                    <p className="text-sm font-semibold">{experienceYears} años</p>
                  </div>
                </div>
              )}
            </div>

            {profile.match_message && (
              <div>
                <h4 className="text-lg font-bold mb-3">Sobre el candidato</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.match_message}
                </p>
              </div>
            )}

            {profile.keywords && profile.keywords.length > 0 && (
              <div>
                <h4 className="text-lg font-bold mb-3">Habilidades / Palabras Clave</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.keywords.map((skill: string, i: number) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5 rounded-xl font-medium bg-primary/5 text-foreground border-primary/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-12 text-center pb-8">
          <h2 className="text-xl font-bold mb-4">¿Buscas talento en hostelería y gastronomía?</h2>
          <Button asChild size="lg" className="rounded-full shadow-md font-bold text-base px-8 h-12">
            <Link href="/login?flow=employer">Registra tu empresa en GOS</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
