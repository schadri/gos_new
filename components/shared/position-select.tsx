'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

type PositionDef = {
  category: string;
  items: string[];
}

const POSITIONS: PositionDef[] = [
  {
    category: "Cocina",
    items: [
      "Chef Ejecutivo", "Chef de Cocina", "Sous Chef", "Chef de Partie",
      "Cocinero", "Sushiman", "Pizzero", "Parrillero", "Pastelero",
      "Panadero", "Ayudante de Cocina", "Bachero"
    ]
  },
  {
    category: "Servicio y Bebidas",
    items: [
      "Sommelier", "Bartender", "Barman", "Barista", "Camarero",
      "Mozo", "Capitán de Meseros", "Maitre", "Host/Hostess",
      "Ayudante de Camarero", "Adicionista", "Recepcionista de Restaurant"
    ]
  },
  {
    category: "Hotelería",
    items: [
      "Gerente de Hotel", "Recepcionista", "Recepcionista de Hotel",
      "Jefe de Recepción", "Conserje", "Botones", "Valet Parking",
      "Room Service"
    ]
  },
  {
    category: "Gestión",
    items: [
      "Gerente General", "Gerente de Restaurant", "Gerente de Restaurante",
      "Gerente de Operaciones", "Gerente de Alimentos y Bebidas",
      "Gerente Administrativo", "Subgerente", "Encargado de Almacén",
      "Comprador"
    ]
  },
  {
    category: "Limpieza y Mantenimiento",
    items: [
      "Ama de Llaves", "Supervisor de Limpieza", "Steward", "Lavaplatos",
      "Limpieza de Restaurant", "Jefe de Mantenimiento", "Encargado de Mantenimiento"
    ]
  },
  {
    category: "Eventos",
    items: [
      "Coordinador de Eventos", "Banquetes"
    ]
  }
]

export function PositionSelect({
  selected,
  onChange,
  max = 2
}: {
  selected: string[];
  onChange: (val: string[]) => void;
  max?: number;
}) {
  const [open, setOpen] = React.useState(false)

  const togglePosition = (pos: string) => {
    if (selected.includes(pos)) {
      onChange(selected.filter((item) => item !== pos))
    } else {
      if (selected.length < max) {
        onChange([...selected, pos])
      }
    }
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((pos) => (
          <Badge key={pos} variant="secondary" className="px-3 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-transparent transition-colors text-sm">
            {pos}
            <button 
              type="button" 
              onClick={() => togglePosition(pos)}
              className="text-primary/70 hover:text-primary pl-1 ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground italic">Ningún puesto seleccionado.</span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 bg-muted/40"
            disabled={selected.length >= max}
          >
            {selected.length >= max ? `Límite alcanzado (${max} máx)` : "Seleccionar un puesto..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar puesto..." />
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandList className="max-h-[300px] overflow-y-auto">
              {POSITIONS.map((group) => (
                <CommandGroup key={group.category} heading={group.category}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={(currentValue) => {
                        // find the real-cased item
                        const exactItem = group.items.find(i => i.toLowerCase() === currentValue.toLowerCase()) || item
                        togglePosition(exactItem)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(item) ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground mt-1">Puedes elegir hasta {max} puestos principales en los que deseas trabajar.</p>
    </div>
  )
}
