'use client'
import * as React from 'react'
import { LocationPicker } from '@/components/shared/location-picker'
import { KeywordInput } from '@/components/shared/keyword-input'
import { PositionSelect } from '@/components/shared/position-select'
import { FileUpload } from '@/components/shared/file-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function TalentRegistration() {
  const router = useRouter()
  const [position, setPosition] = React.useState<string[]>([])
  const [keywords, setKeywords] = React.useState<string[]>([])
  const [location, setLocation] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [cvUrl, setCvUrl] = React.useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [latitude, setLatitude] = React.useState<number | null>(null)
  const [longitude, setLongitude] = React.useState<number | null>(null)
  const [radius, setRadius] = React.useState<number>(5)
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Enforce TALENT role as soon as user lands here
  React.useEffect(() => {
    const claimRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Safe update: don't use upsert to prevent wiping existing data
        await (supabase.from('profiles') as any)
          .update({ user_type: 'TALENT' })
          .eq('id', user.id)
      }
    }
    claimRole()
  }, [])

  const handleSaveProfile = async () => {
    try {
      if (!fullName) {
        toast.error('El nombre completo es obligatorio')
        return
      }
      if (!location) {
        toast.error('La ubicación es obligatoria')
        return
      }

      setIsSubmitting(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        toast.error('No hay una sesión activa, inicie sesión de nuevo.')
        router.push('/login')
        return
      }

      const { error } = await (supabase.from('profiles') as any).upsert({
        id: session.user.id,
        user_type: 'TALENT',
        full_name: fullName,
        location: location,
        position: position,
        keywords: keywords,
        profile_photo: photoUrl?.split('?')[0],
        cv_url: cvUrl?.split('?')[0],
        latitude: latitude,
        longitude: longitude,
        search_radius: radius,
      })

      if (error) {
        throw error
      }

      toast.success('¡Perfil completado exitosamente!')
      router.push('/profile')
      
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error al guardar el perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="talent-theme container mx-auto max-w-3xl py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 px-4 md:px-0">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Completa tu Perfil de Talento</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Cuéntanos sobre ti para conectarte con las mejores oportunidades del sector gastronómico y hotelero.</p>
        </div>

        <div className="grid gap-8 p-6 md:p-8 border rounded-2xl bg-card shadow-sm">
          <div className="grid gap-3">
            <Label htmlFor="fullName" className="text-base font-semibold">Nombre Completo</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: Juan Pérez" className="h-12 text-md bg-muted/40" />
          </div>

          <div className="grid gap-3">
            <Label className="text-base font-semibold">Puestos Objetivo</Label>
            <PositionSelect 
              selected={position} 
              onChange={setPosition} 
              max={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Foto de Perfil</Label>
              <FileUpload value={photoUrl} onChange={setPhotoUrl} label="Subir foto de perfil" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Currículum Vitae</Label>
              <FileUpload value={cvUrl} onChange={setCvUrl} accept=".pdf,.doc,.docx" label="Subir CV" />
              <span className="text-sm text-muted-foreground italic">Recomendaciones: Formato PDF de 1 sola página.</span>
            </div>
          </div>

          <div className="grid gap-3 w-full">
            <LocationPicker 
              value={location} 
              onChange={setLocation}
              latitude={latitude}
              longitude={longitude}
              radius={radius}
              onRadiusChange={setRadius}
              onCoordinatesChange={(lat, lng) => {
                setLatitude(lat)
                setLongitude(lng)
              }}
            />
          </div>

          <div className="grid gap-3">
            <Label className="text-base font-semibold">Habilidades Destacadas</Label>
            <KeywordInput 
              keywords={keywords} 
              onChange={setKeywords} 
              placeholder="Escribe una habilidad y presiona Enter..." 
              suggestions={[
                "Puntual", "Prolijo", "Comprometido", "Iniciativa", "Liderazgo", 
                "Organizado", "Creativo", "Proactivo", "Trabajo en Equipo", 
                "Adaptabilidad", "Resolución de Problemas", "Vocación de Servicio", 
                "Versatilidad", "Eficiente", "Capacidad de Aprendizaje"
              ]}
            />
          </div>

          

          <Button 
            onClick={handleSaveProfile} 
            disabled={isSubmitting}
            size="lg" 
            className="w-full mt-6 h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : "Guardar y Buscar Trabajos"}
          </Button>
        </div>
      </div>
    </div>
  )
}
