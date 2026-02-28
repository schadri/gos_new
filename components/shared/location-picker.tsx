'use client'

import * as React from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LocationPicker({ 
  value, 
  onChange,
  onCoordinatesChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}) {
  return (
    <div className="space-y-2 w-full">
      <Label>Ubicación</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Ej: Buenos Aires, Palermo..." 
          className="pl-9 bg-muted/40 border-muted focus-visible:ring-primary/50 transition-colors"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <p className="text-xs text-muted-foreground">Escribe la ciudad o zona donde buscas oportunidades.</p>
    </div>
  )
}
