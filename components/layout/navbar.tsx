'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Briefcase, User, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import * as React from 'react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  
  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Simple check for unauthenticated/public routes visually
  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname?.includes('/register')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">GOS</span>
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user || !isPublicRoute ? (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">Trabajos</Link>
              <Link href="/employer/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Panel Emprendedor</Link>
              <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">Mi Perfil</Link>
              <Link href="/notifications" className="transition-colors hover:text-foreground/80 text-foreground/60">Notificaciones</Link>
            </nav>
          ) : (
            <div className="flex-1"></div>
          )}
            {!user ? (
              <div className="flex items-center space-x-2 border-l pl-6 ml-6">
                <Button asChild>
                  <Link href="/login">Ingresar</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l pl-6 ml-6">
                <Button variant="ghost" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                {(user || !isPublicRoute) && (
                  <>
                    <Link href="/jobs" className="text-lg font-medium">Trabajos</Link>
                    <Link href="/employer/dashboard" className="text-lg font-medium">Panel Emprendedor</Link>
                    <Link href="/profile" className="text-lg font-medium">Mi Perfil</Link>
                    <Link href="/notifications" className="text-lg font-medium">Notificaciones</Link>
                    <div className="h-px bg-border my-2" />
                  </>
                )}
                {!user ? (
                  <>
                    <Link href="/login" className="text-lg font-medium">Ingresar</Link>
                    <Link href="/talent/register" className="text-lg font-medium text-primary">Postularme</Link>
                  </>
                ) : (
                  <>
                    <button onClick={handleLogout} className="text-lg font-medium text-left text-destructive flex w-full">Cerrar Sesión</button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
