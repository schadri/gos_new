'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, Eye, ArrowLeft, ExternalLink, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'
import { triggerMatchesForTalent } from '@/app/actions/auto-match'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { FileUpload } from '@/components/shared/file-upload'
import { KeywordInput } from '@/components/shared/keyword-input'
import { PositionSelect } from '@/components/shared/position-select'
import { LocationPicker } from '@/components/shared/location-picker'

export function EditProfileModal({
  initialName,
  initialPhoto,
  initialCv,
  initialKeywords,
  initialPositions,
  initialLocation,
  initialLatitude,
  initialLongitude,
  initialRadius = 5,
  initialIsActive = true
}: {
  initialName: string
  initialPhoto: string | null
  initialCv: string | null
  initialKeywords: string[]
  initialPositions: string[]
  initialLocation: string
  initialLatitude?: number | null
  initialLongitude?: number | null
  initialRadius?: number
  initialIsActive?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  
  const [fullName, setFullName] = React.useState(initialName)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(initialPhoto)
  const [cvUrl, setCvUrl] = React.useState<string | null>(initialCv)
  const [keywords, setKeywords] = React.useState<string[]>(initialKeywords)
  const [positions, setPositions] = React.useState<string[]>(initialPositions)
  const [location, setLocation] = React.useState(initialLocation)
  const [latitude, setLatitude] = React.useState<number | null>(initialLatitude || null)
  const [longitude, setLongitude] = React.useState<number | null>(initialLongitude || null)
  const [radius, setRadius] = React.useState<number>(initialRadius)
  const [isActive, setIsActive] = React.useState<boolean>(initialIsActive ?? true)
  
  const [mounted, setMounted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [viewingCv, setViewingCv] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSave = async () => {
    try {
      if (!fullName) {
        toast.error('El nombre completo no puede estar vacío')
        return
      }

      setIsSubmitting(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No estás autenticado')

      const { error } = await (supabase.from('profiles') as any).update({
        full_name: fullName,
        profile_photo: photoUrl?.split('?')[0],
        cv_url: cvUrl?.split('?')[0],
        keywords: keywords,
        position: positions,
        location: location,
        latitude: latitude,
        longitude: longitude,
        search_radius: radius,
        is_active: isActive,
      }).eq('id', user.id)

      if (error) throw error

      toast.success('Perfil actualizado correctamente')
      
      // Trigger auto-matching
      await triggerMatchesForTalent(user.id).catch(console.error)

      setOpen(false)
      router.refresh() // Recarga la página para mostrar los nuevos datos en el Server Component
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
        className={viewingCv ? "w-[calc(100%-1rem)] sm:w-full sm:max-w-[800px] h-[80vh] flex flex-col p-4 sm:p-6" : "w-[calc(100%-1rem)] sm:w-full sm:max-w-[500px] p-4 sm:p-6"}
      >
        <button type="button" autoFocus className="sr-only" tabIndex={0}>Foco</button>
        {viewingCv ? (
          <>
            <DialogHeader className="flex flex-row flex-shrink-0 items-center gap-4 space-y-0 p-4 sm:p-6 border-b">
              <Button variant="ghost" size="icon" onClick={() => setViewingCv(false)} className="rounded-full hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  Visualizando CV
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex-1 min-h-0 bg-muted/20 p-4 md:p-6 overflow-hidden flex flex-col">
              {cvUrl ? (
                <>
                  <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-inner border border-border/40 relative mb-4">
                    <iframe 
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(getAvatarUrl(cvUrl) || '')}&embedded=true`} 
                      className="w-full h-full border-0"
                      title="Curriculum Vitae"
                    />
                  </div>
                  <div className="flex justify-center flex-shrink-0">
                    <Button 
                      variant="outline" 
                      className="rounded-xl font-bold border-border/60 hover:bg-primary/5 hover:text-primary transition-all px-8 bg-card"
                      onClick={() => window.open(getAvatarUrl(cvUrl) || '', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> Abrir original / Descargar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay CV disponible
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Editar Perfil</DialogTitle>
              <DialogDescription>
                Actualiza tu información, sube tu currículum o modifica tus habilidades clave.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto overflow-x-hidden px-2 md:px-4 custom-scrollbar">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="font-semibold">Nombre Completo</Label>
                <Input 
                  id="fullName" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Juan Pérez" 
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">Puestos Deseados (Máx. 2)</Label>
                <PositionSelect 
                  selected={positions} 
                  onChange={setPositions} 
                  max={2} 
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">Foto de Perfil</Label>
                <FileUpload value={photoUrl} onChange={setPhotoUrl} label="Actualizar foto" />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Currículum Vitae (CV)</Label>
                  {cvUrl && (
                    <Button variant="ghost" size="sm" onClick={() => setViewingCv(true)} className="h-8 text-primary">
                      <Eye className="h-4 w-4 mr-2" /> Ver CV actual
                    </Button>
                  )}
                </div>
                <FileUpload value={cvUrl} onChange={setCvUrl} accept=".pdf,.doc,.docx" label="Actualizar CV" />
              </div>

              <div className="grid gap-2 pb-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Habilidades / Keywords</Label>
                  {keywords.length > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setKeywords([])} 
                      className="h-7 text-[11px] px-2 font-bold"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Limpiar todo
                    </Button>
                  )}
                </div>
                <KeywordInput 
                  keywords={keywords}
                  onChange={setKeywords}
                  placeholder="Ej: Cocina peruana, Inventarios..."
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">Ubicación</Label>
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

              <div className="flex items-center justify-between border rounded-2xl p-4 bg-muted/30 mt-2">
                <div className="space-y-0.5">
                  <Label className="font-bold text-sm">Búsqueda Activa</Label>
                  <p className="text-[12px] text-muted-foreground leading-tight mr-4 min-w-0 break-words">
                    Permite que las ofertas de empleo ajustadas a tu perfil te hagan "Match" automáticamente.
                  </p>
                </div>
                <Switch 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                  className="data-[state=checked]:bg-primary scale-90"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-2 pt-2 sm:pt-0">
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
