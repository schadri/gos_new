'use client'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/chat')) return null

  return (
    <footer className="border-t bg-muted/20 transition-all mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-8 md:flex-row px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
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
