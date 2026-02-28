'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, Eye, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
import { FileUpload } from '@/components/shared/file-upload'
import { KeywordInput } from '@/components/shared/keyword-input'

export function EditProfileModal({
  initialName,
  initialPhoto,
  initialCv,
  initialKeywords
}: {
  initialName: string
  initialPhoto: string | null
  initialCv: string | null
  initialKeywords: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  
  const [fullName, setFullName] = React.useState(initialName)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(initialPhoto)
  const [cvUrl, setCvUrl] = React.useState<string | null>(initialCv)
  const [keywords, setKeywords] = React.useState<string[]>(initialKeywords)
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [viewingCv, setViewingCv] = React.useState(false)

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

      const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        profile_photo: photoUrl,
        cv_url: cvUrl,
        keywords: keywords,
      }).eq('id', user.id)

      if (error) throw error

      toast.success('Perfil actualizado correctamente')
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
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 hover:bg-muted" title="Editar Perfil">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className={viewingCv ? "sm:max-w-[800px] h-[80vh] flex flex-col" : "sm:max-w-[500px]"}>
        {viewingCv ? (
          <>
            <DialogHeader className="flex flex-row flex-shrink-0 items-center gap-4 space-y-0 pb-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => setViewingCv(false)} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold">Visualizando CV</DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex-1 min-h-0 bg-muted/30 rounded-lg overflow-hidden mt-4">
              {cvUrl ? (
                <iframe 
                  src={cvUrl} 
                  className="w-full h-full border-0"
                  title="Curriculum Vitae"
                />
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

            <div className="grid gap-6 py-4">
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

              <div className="grid gap-2">
                <Label className="font-semibold">Habilidades / Keywords</Label>
                <KeywordInput 
                  keywords={keywords}
                  onChange={setKeywords}
                  placeholder="Ej: Cocina peruana, Inventarios..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSubmitting} className="font-bold">
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
