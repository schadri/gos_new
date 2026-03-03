'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { PROVINCES } from '@/lib/constants/locations'

export function LocationPicker({ 
  value, 
  onChange,
  onCoordinatesChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}) {
  const [open, setOpen] = React.useState(false)
  
  // Parse existing value into province and detail if possible
  const [selectedProvince, setSelectedProvince] = React.useState(() => {
    if (!value) return ""
    return PROVINCES.find(p => value.includes(p)) || ""
  })
  const [detail, setDetail] = React.useState(() => {
    if (!value) return ""
    if (!selectedProvince) return value
    return value.replace(selectedProvince, "").replace(/^,?\s*/, "").trim()
  })

  const [delayedMapQuery, setDelayedMapQuery] = React.useState(value || "")

  // Sync internal state with prop if updated from outside
  React.useEffect(() => {
    if (!value) {
      setSelectedProvince("")
      setDetail("")
      return
    }
    
    const combined = selectedProvince && detail 
      ? `${selectedProvince}, ${detail}` 
      : selectedProvince || detail
    
    if (combined !== value) {
      const foundProvince = PROVINCES.find(p => value.includes(p)) || ""
      setSelectedProvince(foundProvince)
      if (foundProvince) {
        setDetail(value.replace(foundProvince, "").replace(/^,?\s*/, "").trim())
      } else {
        setDetail(value)
      }
    }
  }, [value])

  // Update combined value when selections change
  React.useEffect(() => {
    const combined = selectedProvince && detail 
      ? `${selectedProvince}, ${detail}` 
      : selectedProvince || detail
    
    if (combined !== value) {
      onChange(combined)
    }

    const handler = setTimeout(() => {
      setDelayedMapQuery(combined)
    }, 1000)
    
    return () => clearTimeout(handler)
  }, [selectedProvince, detail])

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Provincia</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-12 justify-between bg-muted/40 border-muted text-md font-normal"
              >
                {selectedProvince
                  ? selectedProvince
                  : "Seleccionar provincia..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar provincia..." />
                <CommandList>
                  <CommandEmpty>No se encontró la provincia.</CommandEmpty>
                  <CommandGroup>
                    {PROVINCES.map((province) => (
                      <CommandItem
                        key={province}
                        value={province}
                        onSelect={(currentValue) => {
                          setSelectedProvince(currentValue === selectedProvince ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProvince === province ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {province}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Localidad / Barrio / Calle</Label>
          <div className="relative">
            <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Ej: Palermo, San Miguel..." 
              className="pl-9 h-12 bg-muted/40 border-muted text-md"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-[250px] bg-muted/40 rounded-2xl overflow-hidden border border-border/50 shadow-inner">
        {delayedMapQuery.trim().length > 2 ? (
          <iframe
            title="Mapa de Ubicación"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(delayedMapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <MapPin className="h-10 w-10 mb-3 opacity-30 text-primary" />
            <span className="text-sm font-semibold">Selecciona una provincia y escribe tu localidad.</span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1 uppercase tracking-wider font-bold">
        <MapPin className="h-3 w-3 text-primary" /> Ubicación guardada: {value || "Pendiente"}
      </p>
    </div>
  )
}
