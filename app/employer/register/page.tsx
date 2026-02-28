'use client'
import * as React from 'react'
import { LocationPicker } from '@/components/shared/location-picker'
import { FileUpload } from '@/components/shared/file-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function EmployerRegistration() {
  const [location, setLocation] = React.useState('')
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)

  return (
    <div className="container mx-auto max-w-3xl py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 px-4 md:px-0">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Registra tu Emprendimiento</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Crea el perfil de tu local u hotel para publicar ofertas y encontrar el mejor talento.</p>
        </div>

        <div className="grid gap-8 p-6 md:p-8 border rounded-2xl bg-card shadow-sm">
          <div className="grid gap-3">
            <Label htmlFor="companyName" className="text-base font-semibold">Nombre del Emprendimiento / Empresa</Label>
            <Input id="companyName" placeholder="Ej: La Esquina de San Juan" className="h-12 text-md bg-muted/40" />
          </div>

          <div className="grid gap-3 w-full">
            <LocationPicker 
              value={location} 
              onChange={setLocation} 
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description" className="text-base font-semibold">Descripción breve del negocio</Label>
            <Textarea 
              id="description" 
              placeholder="Restaurante de comida de autor en el centro..."
              rows={5}
              className="resize-none bg-muted/40 text-md p-4"
            />
          </div>

          <div className="grid gap-3">
            <Label className="text-base font-semibold">Logo de la Empresa (Opcional)</Label>
            <FileUpload value={logoUrl} onChange={setLogoUrl} label="Subir logo" />
          </div>

          <Button size="lg" className="w-full mt-6 h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all">Guardar y Publicar Empleos</Button>
        </div>
      </div>
    </div>
  )
}
