'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function KeywordInput({
  keywords,
  onChange,
  placeholder = "Escribe y presiona Enter..."
}: {
  keywords: string[];
  onChange: (keys: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = React.useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = inputValue.trim()
      if (val && !keywords.includes(val)) {
        onChange([...keywords, val])
        setInputValue('')
      }
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
    </div>
  )
}
