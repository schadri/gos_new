'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MapPin, Search, Navigation, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
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
import dynamic from 'next/dynamic'

const MapRadius = dynamic(() => import('./map-radius'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
      <Loader2 className="h-10 w-10 mb-3 animate-spin opacity-30 text-primary" />
      <span className="text-sm font-semibold uppercase tracking-widest text-[10px]">Cargando mapa interactivo...</span>
    </div>
  )
})

export function LocationPicker({ 
  value, 
  onChange,
  radius = 5,
  onRadiusChange,
  latitude,
  longitude,
  onCoordinatesChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
  radius?: number;
  onRadiusChange?: (val: number) => void;
  latitude?: number | null;
  longitude?: number | null;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}) {
  const [open, setOpen] = React.useState(false)
  const [isLocating, setIsLocating] = React.useState(false)
  
  // Default center if nothing is selected (Buenos Aires approximately)
  const defaultCenter: [number, number] = [-34.6037, -58.3816]
  const mapCenter: [number, number] = latitude && longitude 
    ? [latitude, longitude] 
    : defaultCenter

  // Parse existing value into province and detail if possible
  const [selectedProvince, setSelectedProvince] = React.useState(() => {
    if (!value) return ""
    return PROVINCES.find(p => value.includes(p)) || ""
  })
  const [detail, setDetail] = React.useState(() => {
    if (!value) return ""
    if (!selectedProvince) return value.replace(/,,+/g, ',').replace(/^[,\s]+|[,\s]+$/g, "").trim()
    return value.replace(selectedProvince, "").replace(/,,+/g, ',').replace(/^[,\s]+|[,\s]+$/g, "").trim()
  })

  // Sync internal state with prop ONLY when it changes from the outside
  // to avoid infinite loops with the onChange callback.
  React.useEffect(() => {
    if (!value) {
      setSelectedProvince("")
      setDetail("")
      return
    }
    
    // Check if the current internal state already represents the incoming 'value'
    const cleanDetailCheck = detail 
      ? detail.replace(/,,+/g, ',').replace(/^[,\s]+|[,\s]+$/g, '').trim() 
      : ''
      
    const currentCombined = [cleanDetailCheck, selectedProvince]
      .filter(Boolean)
      .join(', ')
    
    if (currentCombined !== value) {
      const foundProvince = PROVINCES.find(p => value.includes(p)) || ""
      setSelectedProvince(foundProvince)
      if (foundProvince) {
        const cleanDetail = value
          .replace(foundProvince, "")
          .replace(/,,+/g, ',')
          .replace(/^[,\s]+|[,\s]+$/g, "")
          .trim()
        setDetail(cleanDetail)
      } else {
        setDetail(value.replace(/,,+/g, ',').replace(/^[,\s]+|[,\s]+$/g, "").trim())
      }
    }
  }, [value]) // We only react to outside value changes

  // Helper to update everything at once and notify parent
  // This reduces the number of separate state updates that can trigger effects
  const updateLocation = (newProvince: string, newDetail: string) => {
    setSelectedProvince(newProvince)
    
    // Clean up any double commas or stray commas from the newDetail string
    const cleanDetail = newDetail
      .replace(/,,+/g, ',')
      .replace(/^[,\s]+|[,\s]+$/g, '')
      .trim()
      
    setDetail(cleanDetail)
    
    // Combine detail and province carefully, avoiding ", ,"
    const combined = [cleanDetail, newProvince]
      .filter(Boolean)
      .join(', ')
    
    if (combined !== value) {
      onChange(combined)
    }
  }

  const parseAddressAndUpdate = (addr: any, lat: number, lon: number) => {
    if (onCoordinatesChange) {
      onCoordinatesChange(lat, lon)
    }

    const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || ""
    const city = addr.city || addr.town || addr.village || ""
    const province = addr.state || ""
    
    let matchedProvince = ""
    if (province) {
      if (province.includes("Autónoma de Buenos Aires") || province.includes("Capital Federal")) {
        matchedProvince = "Capital Federal (CABA)"
      } else {
        matchedProvince = PROVINCES.find(p => 
          province.toLowerCase().includes(p.toLowerCase()) || 
          p.toLowerCase().includes(province.toLowerCase())
        ) || ""
      }
    }
    
    let detailParts = [neighborhood, city].filter(Boolean)
    if (matchedProvince) {
       const cleanProvince = matchedProvince.split('(')[0].trim().toLowerCase()
       detailParts = detailParts.filter(p => !p.toLowerCase().includes(cleanProvince))
    }

    const detailedAddr = detailParts.join(", ")
    updateLocation(matchedProvince || selectedProvince, detailedAddr)
  }

  // Function to get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'es'
              }
            }
          )
          const data = await response.json()
          
          if (data && data.address) {
            parseAddressAndUpdate(data.address, lat, lon)
          } else {
            if (onCoordinatesChange) onCoordinatesChange(lat, lon)
            updateLocation(selectedProvince, `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error)
          if (onCoordinatesChange) onCoordinatesChange(lat, lon)
          updateLocation(selectedProvince, `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setIsLocating(false)
        alert("No se pudo obtener tu ubicación actual. Revisa los permisos de tu navegador.")
      },
      { enableHighAccuracy: true }
    )
  }

  const handleSearchLocation = async () => {
    if (!detail && !selectedProvince) return;
    
    setIsLocating(true)
    try {
      const queryParams = [detail, selectedProvince, "Argentina"].filter(Boolean).join(", ")
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryParams)}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const item = data[0]
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        if (item.address) {
          parseAddressAndUpdate(item.address, lat, lon)
        } else {
          updateLocation(selectedProvince, detail)
          if (onCoordinatesChange) onCoordinatesChange(lat, lon)
        }
      } else {
        alert("No se encontró la ubicación ingresada en el mapa. Intenta ser más específico.")
      }
    } catch (error) {
      console.error("Error validando ubicación:", error)
      alert("Error al validar la ubicación.")
    } finally {
      setIsLocating(false)
    }
  }

  // We removed the automatic effect that calls onChange to avoid loops.
  // Instead, we use updateLocation in the handlers.
  
  // Note: We removed the auto-sync useEffect on [selectedProvince, detail].
  // Now, the user MUST press Enter (or select province) to trigger updateLocation, 
  // ensuring the typed text is validated against the map before being saved.

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          
          <Popover open={open} onOpenChange={setOpen} modal={true}>
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
                          const newProv = currentValue === selectedProvince ? "" : province
                          updateLocation(newProv, detail)
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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Localidad / Barrio (Ej: Belgrano)" 
                className="pl-9 h-12 bg-muted/40 border-muted text-md"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearchLocation()
                  }
                }}
              />
            </div>
            <Button 
              type="button" 
              variant="default" 
              size="icon" 
              className="h-12 w-12 shrink-0 shadow-sm"
              onClick={handleSearchLocation}
              disabled={isLocating}
              title="Buscar ubicación"
            >
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 shrink-0 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              title="Obtener ubicación actual"
            >
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {onRadiusChange && (
        <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Radio de búsqueda/matching
            </Label>
            <span className="text-sm font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {radius} km
            </span>
          </div>
          <Slider
            value={[radius]}
            min={2}
            max={50}
            step={1}
            onValueChange={(vals) => onRadiusChange(vals[0])}
            showTooltip
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
            <span>2 km</span>
            <span>50 km</span>
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-[300px] bg-muted/40 rounded-2xl overflow-hidden border border-border/50 shadow-inner">
        {latitude && longitude ? (
          <MapRadius center={mapCenter} radius={radius} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 p-6 text-center">
            <MapPin className="h-12 w-12 mb-4 opacity-30 text-primary animate-bounce" />
            <span className="text-sm font-bold uppercase tracking-widest text-balance">
              Obtén tu ubicación o selecciona una provincia para ver el mapa interactivo
            </span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1 uppercase tracking-wider font-bold">
        <MapPin className="h-3 w-3 text-primary" /> Ubicación guardada: {value || "Pendiente"}
      </p>
    </div>
  )
}
