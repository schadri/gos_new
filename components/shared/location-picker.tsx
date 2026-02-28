'use client'

import * as React from 'react'
import { MapPin, Search } from 'lucide-react'
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
  const [delayedValue, setDelayedValue] = React.useState(value)

  // Debounce the input by 1000ms to avoid re-rendering map continuously
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDelayedValue(value)
    }, 1000)
    return () => clearTimeout(handler)
  }, [value])

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label>Buscar Ubicación</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Ej: Buenos Aires, Palermo..." 
            className="pl-9 h-10 border-muted focus-visible:ring-primary/50 transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> Escribe tu localidad y verifica el mapa abajo.
        </p>
      </div>

      <div className="flex-1 w-full h-[250px] bg-muted/40 rounded-xl overflow-hidden border">
        {delayedValue.trim().length > 2 ? (
          <iframe
            title="Mapa de Ubicación"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(delayedValue)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <MapPin className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">El mapa aparecerá aquí al escribir.</span>
          </div>
        )}
      </div>
    </div>
  )
}
