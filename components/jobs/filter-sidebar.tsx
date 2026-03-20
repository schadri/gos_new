'use client'

import * as React from 'react'
import { Filter, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { POSITIONS } from '@/lib/constants/positions'

interface FilterSidebarProps {
  clearFilters: () => void
  selectedPositions: string[]
  handlePositionChange: (pos: string) => void
  expandedCategory: string | null
  setExpandedCategory: (category: string | null) => void
  selectedLocations: string[]
  handleLocationChange: (loc: string) => void
  className?: string
}

export function FilterSidebar({
  clearFilters,
  selectedPositions,
  handlePositionChange,
  expandedCategory,
  setExpandedCategory,
  selectedLocations,
  handleLocationChange,
  className
}: FilterSidebarProps) {
  return (
    <div className={cn("space-y-10", className)}>
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" /> Filtros
          </h3>
          <button 
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            Limpiar
          </button>
        </div>
        
        <div className="space-y-8">
          {/* Position Filter */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-foreground">Puesto</h4>
            <div className="space-y-2">
              {POSITIONS.map(group => (
                <div key={group.category} className="space-y-2">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === group.category ? null : group.category)}
                    className={cn(
                      "w-full flex items-center justify-between text-sm font-semibold p-2 rounded-xl transition-colors",
                      expandedCategory === group.category ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {group.category}
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      expandedCategory === group.category && "rotate-90"
                    )} />
                  </button>
                  
                  {expandedCategory === group.category && (
                    <div className="pl-4 space-y-3 pt-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                      {group.items.map(item => (
                        <div key={item} className="flex items-center gap-3 group">
                          <input 
                            type="checkbox" 
                            id={`pos-${item}`} 
                            checked={selectedPositions.includes(item)}
                            onChange={() => handlePositionChange(item)}
                            className="rounded-md border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 bg-muted/20 cursor-pointer" 
                          />
                          <label htmlFor={`pos-${item}`} className="text-xs cursor-pointer text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
