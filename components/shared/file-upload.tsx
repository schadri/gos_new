'use client'

import * as React from 'react'
import { UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Debes estar autenticado para subir archivos')

      const isImage = accept.includes('image')
      const bucket = isImage ? 'avatars' : 'documents'
      
      // Clean up file name to avoid issues
      const fileExt = file.name.split('.').pop()
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      const filePath = `${user.id}/${safeName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(publicUrl)
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
      <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/10">
        <div className="w-16 h-16 rounded-md overflow-hidden relative bg-muted/30 flex items-center justify-center flex-shrink-0 shadow-sm border">
          {accept.includes('image') ? (
            <img src={value} alt="Preview" className="object-cover w-full h-full" />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">DOC</span>
          )}
        </div>
        <div className="flex-1 truncate text-sm font-medium">Archivo cargado exitosamente</div>
        <Button variant="ghost" size="icon" onClick={() => onChange(null)} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer relative group">
      <div className="p-3 bg-background rounded-full shadow-sm border mb-3 group-hover:scale-105 transition-transform duration-300">
        <UploadCloud className="h-6 w-6 text-primary/80" />
      </div>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">Haz clic o arrastra un archivo hasta aquí</span>
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
  )
}
