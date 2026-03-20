'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function KeywordInput({
  keywords,
  onChange,
  placeholder = "Escribe y presiona Enter...",
  suggestions = [],
  max
}: {
  keywords: string[];
  onChange: (keys: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  max?: number;
}) {
  const maxLimit = max || 8

  // User's exact list of keywords
  const baseSuggestions = [
    "Puntual", "Prolijo", "Comprometido", "Iniciativa", "Liderazgo",
    "Organizado", "Creativo", "Proactivo", "Trabajo en Equipo", "Adaptabilidad",
    "Resolución de Problemas", "Vocación de Servicio", "Versatilidad",
    "Eficiente", "Capacidad de Aprendizaje"
  ]

  // We filter out what is already selected
  const activeSuggestions = React.useMemo(() => {
    return baseSuggestions.filter(s => !keywords.includes(s))
  }, [keywords])


  const addKeyword = (val: string) => {
    if (keywords.length >= maxLimit) {
      toast.error(`Solo puedes agregar hasta ${maxLimit} habilidades`)
      return
    }
    const cleanVal = val.trim()
    if (cleanVal && !keywords.includes(cleanVal)) {
      onChange([...keywords, cleanVal])
    }
  }

  const removeKeyword = (idx: number) => {
    onChange(keywords.filter((_, i) => i !== idx))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, idx) => (
          <Badge key={idx} variant="secondary" className="px-3 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-transparent transition-colors">
            {kw}
            <button 
              type="button" 
              onClick={() => removeKeyword(idx)}
              className="text-primary/70 hover:text-primary pl-1 ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && (
          <span className="text-sm text-muted-foreground italic">Ninguna habilidad seleccionada.</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/50">
        <p className="text-[11px] font-bold text-muted-foreground">
          {keywords.length}/{maxLimit} habilidades seleccionadas
        </p>
      </div>

      {activeSuggestions.length > 0 && keywords.length < maxLimit && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Selecciona tus habilidades principales:</p>
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2 pb-2">
            {activeSuggestions.map((s, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 hover:text-primary font-normal text-muted-foreground transition-colors border-muted"
                onClick={() => addKeyword(s)}
              >
                + {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
