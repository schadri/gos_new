
'use client'

import * as React from 'react'
import { Briefcase, Loader2 } from 'lucide-react'

export function RedirectLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative flex flex-col items-center">
        {/* Animated Glow behind icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[40px] animate-pulse"></div>
        
        {/* Brand Icon */}
        <div className="relative mb-8 p-6 bg-card border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 group">
          <Briefcase className="h-10 w-10 text-primary animate-bounce duration-[2000ms]" />
        </div>
        
        {/* Loading text with shimmer */}
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Configurando tu espacio
          </h2>
          <p className="text-muted-foreground font-medium max-w-[250px] mx-auto text-sm">
            Estamos preparando tu experiencia personalizada en GOS...
          </p>
        </div>
        
        {/* Progress bar simulation */}
        <div className="mt-10 w-48 h-1.5 bg-muted rounded-full overflow-hidden relative border border-border/5">
          <div className="absolute top-0 left-0 h-full bg-primary animate-[loading_2s_ease-in-out_infinite] rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; left: 0%; }
          50% { width: 40%; left: 30%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  )
}
