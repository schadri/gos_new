'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileUpload } from '@/components/shared/file-upload'
import { LocationPicker } from '@/components/shared/location-picker'

export function EditEmployerProfileModal({
  initialName,
  initialPhoto,
  initialDescription,
  initialLocation,
  initialLatitude,
  initialLongitude,
  initialRadius = 5,
}: {
  initialName: string
  initialPhoto: string | null
  initialDescription: string
  initialLocation: string
  initialLatitude?: number | null
  initialLongitude?: number | null
  initialRadius?: number
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  
  const [companyName, setCompanyName] = React.useState(initialName)
  const [companyLogo, setCompanyLogo] = React.useState<string | null>(initialPhoto)
  const [companyDescription, setCompanyDescription] = React.useState(initialDescription)
  const [location, setLocation] = React.useState(initialLocation)
  const [latitude, setLatitude] = React.useState<number | null>(initialLatitude || null)
  const [longitude, setLongitude] = React.useState<number | null>(initialLongitude || null)
  const [radius, setRadius] = React.useState<number>(initialRadius)
  
  const [mounted, setMounted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSave = async () => {
    try {
      if (!companyName) {
        toast.error('El nombre de la empresa no puede estar vacío')
        return
      }
      if (!location) {
        toast.error('La ubicación es obligatoria')
        return
      }

      setIsSubmitting(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No estás autenticado')

      // Ensure the profile exists for the user, creating it if not
      await (supabase.from('profiles') as any).upsert({
        id: user.id,
        user_type: 'EMPLOYER' // Assuming this is an employer profile
      })

      const { error } = await (supabase.from('profiles') as any).update({
        company_name: companyName,
        company_logo: companyLogo?.split('?')[0],
        company_description: companyDescription,
        location: location,
        latitude: latitude,
        longitude: longitude,
        search_radius: radius,
      }).eq('id', user.id)

      if (error) throw error

      toast.success('Perfil de empresa actualizado correctamente')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="absolute top-4 right-4 hover:bg-muted z-20 font-bold rounded-xl flex items-center gap-2 border-border/50 text-muted-foreground shadow-sm" 
          title="Editar Perfil"
        >
          <Settings className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[500px] p-4 sm:p-6"
      >
        <button type="button" autoFocus className="sr-only" tabIndex={0}>Foco</button>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Perfil de Empresa</DialogTitle>
          <DialogDescription>
            Actualiza los datos de tu emprendimiento para que los postulantes lo conozcan mejor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto overflow-x-hidden px-2 md:px-4 custom-scrollbar">
          <div className="w-32 h-32 bg-muted rounded-2xl border border-border shadow-sm mb-4 mx-auto flex items-center justify-center overflow-hidden">
            {companyLogo ? (
              <img src={getAvatarUrl(companyLogo) || undefined} alt="Logo Preview" className="w-full h-full object-cover" />
            ) : (
              <Settings className="h-16 w-16 text-muted-foreground" />
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="companyName" className="font-semibold">Nombre del Emprendimiento</Label>
            <Input 
              id="companyName" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nombre del emprendimiento" 
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-semibold">Logo de la Empresa</Label>
            <FileUpload value={companyLogo} onChange={setCompanyLogo} label="Actualizar logo" />
          </div>

          <div className="grid gap-2">
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

          <div className="grid gap-2">
            <Label htmlFor="companyDescription" className="font-semibold">Descripción del Negocio</Label>
            <Textarea 
              id="companyDescription" 
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Cuéntanos un poco sobre tu negocio..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4 sm:mt-6">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={isSubmitting}
            className="w-full sm:w-auto font-semibold"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting} 
            className="w-full sm:w-auto font-bold"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            ) : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
