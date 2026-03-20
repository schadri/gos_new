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
            className="text-[10px] bg-primary/10 text-primary px-2 py-1.5 rounded-md hover:bg-primary/20 transition-colors uppercase tracking-wider font-black flex items-center gap-1"
          >
            Limpiar
          </button>
        </div>
        
        <div className="space-y-8">
          {/* Position Filter */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-3">
              {expandedCategory && (
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="text-[10px] bg-primary/10 text-primary px-2 py-1.5 rounded-md hover:bg-primary/20 transition-colors uppercase tracking-wider font-black flex items-center gap-1"
                >
                  <ChevronRight className="h-3 w-3 rotate-180" /> Volver
                </button>
              )}
              {!expandedCategory && <span>Puesto</span>}
            </h4>
            
            <div className="space-y-2">
              {!expandedCategory ? (
                /* Category List View */
                <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  {POSITIONS.map(group => (
                    <button 
                      key={group.category}
                      onClick={() => setExpandedCategory(group.category)}
                      className="w-full flex items-center justify-center text-sm font-bold p-3.5 rounded-2xl transition-all bg-muted/30 hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20 group relative"
                    >
                      {group.category}
                      <ChevronRight className="h-4 w-4 opacity-0 absolute right-4 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              ) : (
                /* Subcategory View */
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs font-black text-primary uppercase tracking-widest text-center">{expandedCategory}</p>
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {POSITIONS.find(g => g.category === expandedCategory)?.items.map(item => (
                      <div key={item} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                        <input 
                          type="checkbox" 
                          id={`pos-${item}`} 
                          checked={selectedPositions.includes(item)}
                          onChange={() => handlePositionChange(item)}
                          className="rounded-md border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 bg-muted/20 cursor-pointer" 
                        />
                        <label 
                          htmlFor={`pos-${item}`} 
                          className="text-xs cursor-pointer text-muted-foreground font-semibold group-hover:text-foreground transition-colors flex-1"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
