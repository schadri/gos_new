'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, UserCircle2, Mail, Phone, Calendar } from "lucide-react"

interface ApplicantModalProps {
  profile: any
  applicationDate: string
  experienceYears?: number | null
}

export function ApplicantModal({ profile, applicationDate, experienceYears }: ApplicantModalProps) {
  if (!profile) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-border/60">
          Ver Perfil Completo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden bg-card border-border/60 my-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-primary/5 p-8 border-b border-border/50 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-10 h-10 text-primary/60" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">{profile.full_name || 'Candidato'}</DialogTitle>
              <p className="text-lg text-muted-foreground font-medium">{profile.position?.[0] || 'Profesional'}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/40 col-span-2 sm:col-span-1">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-0.5">Postulación</p>
                <p className="text-sm font-semibold">{new Date(applicationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-3">Sobre el candidato</h4>
            <p className="text-muted-foreground leading-relaxed">
              {profile.match_message || 'Este candidato no ha proporcionado una descripción detallada o mensaje de presentación.'}
            </p>
          </div>

          {profile.keywords && profile.keywords.length > 0 && (
            <div>
              <h4 className="text-lg font-bold mb-3">Habilidades / Palabras Clave</h4>
              <div className="flex flex-wrap gap-2">
                {profile.keywords.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-xl font-medium bg-primary/10 text-primary border-primary/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.cv_url && (
            <div className="pt-4 border-t border-border/40">
              <Button variant="default" className="w-full bg-primary font-bold shadow-md rounded-xl" onClick={() => window.open(profile.cv_url, '_blank')}>
                Ver CV
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
