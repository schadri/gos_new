'use client'

import * as React from 'react'
import { UploadCloud, X, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ImageEditor } from '@/components/shared/image-editor'
import { getAvatarUrl } from '@/lib/utils'

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  label = "Subir archivo"
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  label?: string;
}) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [editorImage, setEditorImage] = React.useState<string | null>(null)
  const [editorOpen, setEditorOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isImageAccept = accept.includes('image')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // If it's an image, open the editor first
    if (isImageAccept && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setEditorImage(reader.result as string)
        setEditorOpen(true)
      }
      reader.readAsDataURL(file)
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Non-image files go straight to upload
    await uploadFile(file)
  }

  const handleEditorConfirm = async (croppedBlob: Blob) => {
    setEditorOpen(false)
    setEditorImage(null)
    const file = new File([croppedBlob], `edited_${Date.now()}.jpg`, { type: 'image/jpeg' })
    await uploadFile(file)
  }

  const handleEditorCancel = () => {
    setEditorOpen(false)
    setEditorImage(null)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    
    try {
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      let user = session?.user || null
      
      if (!user) {
        const { data: { user: verifiedUser } } = await supabase.auth.getUser()
        user = verifiedUser
      }
      
      if (!user) {
        throw new Error('No se pudo verificar tu sesión. Por favor, asegúrate de estar logueado y recarga la página.')
      }

      const isImage = accept.includes('image')
      const bucket = isImage ? 'avatars' : 'documents'
      
      // Fixed path per user — this ensures old file is replaced (upsert)
      const fileExt = isImage ? 'jpg' : (file.name.split('.').pop() || 'pdf')
      const filePath = isImage
        ? `${user.id}/avatar.${fileExt}`
        : `${user.id}/cv.${fileExt}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (error) throw error

      // Store the full path including the bucket name, e.g. "avatars/userId/avatar.jpg"
      // Append a unique "u" (upload) timestamp to force a state change and UI refresh in parent components
      onChange(`${bucket}/${data.path}?u=${Date.now()}`)
      toast.success('Archivo subido correctamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al subir el archivo. Revisa si el bucket existe.')
      console.error('Upload Error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (value) {
    return (
      <>
        <ImageEditor
          imageSrc={editorImage}
          open={editorOpen}
          onConfirm={handleEditorConfirm}
          onCancel={handleEditorCancel}
          aspectRatio={1}
        />
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/10">
          <div className="w-16 h-16 rounded-md overflow-hidden relative bg-muted/30 flex items-center justify-center flex-shrink-0 shadow-sm border">
            {isImageAccept ? (
              <img src={getAvatarUrl(value) || ''} alt="Preview" className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">DOC</span>
            )}
          </div>
          <div className="flex-1 truncate text-sm font-medium min-w-0">Archivo cargado exitosamente</div>
          {isImageAccept && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
              title="Cambiar imagen"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onChange(null)} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <ImageEditor
        imageSrc={editorImage}
        open={editorOpen}
        onConfirm={handleEditorConfirm}
        onCancel={handleEditorCancel}
        aspectRatio={1}
      />
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer relative group">
        <div className="p-3 bg-background rounded-full shadow-sm border mb-3 group-hover:scale-105 transition-transform duration-300">
          <UploadCloud className="h-6 w-6 text-primary/80" />
        </div>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">Haz clic o arrastra un archivo hasta aquí</span>
        <input 
          ref={fileInputRef}
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px] rounded-xl z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-foreground">Subiendo...</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
