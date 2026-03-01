'use client'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/chat')) return null

  return (
    <footer className="border-t bg-muted/20 pb-16 md:pb-0 transition-all">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0 px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-3">
          <Briefcase className="h-6 w-6 text-muted-foreground" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Diseñado para la industria de la gastronomía y hotelería.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} GOS. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
