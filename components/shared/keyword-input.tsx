'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function KeywordInput({
  keywords,
  onChange,
  placeholder = "Escribe y presiona Enter...",
  suggestions = []
}: {
  keywords: string[];
  onChange: (keys: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [inputValue, setInputValue] = React.useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(inputValue)
    }
  }

  const addKeyword = (val: string) => {
    const cleanVal = val.trim()
    if (cleanVal && !keywords.includes(cleanVal)) {
      onChange([...keywords, cleanVal])
      setInputValue('')
    }
  }

  const removeKeyword = (idx: number) => {
    onChange(keywords.filter((_, i) => i !== idx))
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
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-muted/40 border-muted focus-visible:ring-primary/50 transition-colors"
      />
      {suggestions.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Sugerencias (haz clic para agregar):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.filter(s => !keywords.includes(s)).map((s, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted font-normal text-muted-foreground transition-colors"
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
