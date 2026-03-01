'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
}: {
  initialName: string
  initialPhoto: string | null
  initialDescription: string
  initialLocation: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  
  const [companyName, setCompanyName] = React.useState(initialName)
  const [companyLogo, setCompanyLogo] = React.useState<string | null>(initialPhoto)
  const [companyDescription, setCompanyDescription] = React.useState(initialDescription)
  const [location, setLocation] = React.useState(initialLocation)
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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

      const { error } = await supabase.from('profiles').update({
        company_name: companyName,
        company_logo: companyLogo,
        company_description: companyDescription,
        location: location,
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
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 hover:bg-muted z-10" title="Editar Perfil">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Perfil de Empresa</DialogTitle>
          <DialogDescription>
            Actualiza los datos de tu emprendimiento para que los postulantes lo conozcan mejor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid gap-2">
            <Label htmlFor="companyName" className="font-semibold">Nombre del Emprendimiento</Label>
            <Input 
              id="companyName" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ej: La Esquina de San Juan" 
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
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="companyDescription" className="font-semibold">Descripción del Negocio</Label>
            <Textarea 
              id="companyDescription" 
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Breve historia, tipo de comida, etc."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="font-bold">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            ) : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
