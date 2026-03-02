'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, User, Menu, LogOut, Bell } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const [role, setRole] = React.useState<string | null>(null)
  const [profile, setProfile] = React.useState<{ name?: string, avatar?: string } | null>(null)
  
  React.useEffect(() => {
    const supabase = createClient()
    
    const fetchUserAndRole = async (sessionUser: any) => {
      setUser(sessionUser)
      if (sessionUser) {
        // First check metadata
        let currentRole = sessionUser.user_metadata?.role
        // Then verify with the database and get profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type, full_name, profile_photo, company_logo')
          .eq('id', sessionUser.id)
          .maybeSingle()
          
        if (profileData) {
          if (profileData.user_type === 'BUSINESS') {
            currentRole = 'employer'
          }
          setRole(currentRole)
          setProfile({
            name: profileData.full_name,
            avatar: profileData.user_type === 'BUSINESS' ? profileData.company_logo : profileData.profile_photo
          })
        } else {
          setRole(currentRole)
        }
      } else {
        setRole(null)
        setProfile(null)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndRole(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user || null)
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
              {role === 'employer' ? (
                <>
                  <Link href="/employer/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Portal Emprendedor</Link>
                  <Link href="/notifications" className="transition-colors hover:text-foreground/80 text-foreground/60">Notificaciones</Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">Trabajos</Link>
                  <Link href="/notifications" className="transition-colors hover:text-foreground/80 text-foreground/60">Notificaciones</Link>
                </>
              )}
            </nav>
          ) : (
            <div className="flex-1"></div>
          )}
            {!user && !pathname?.includes('/login') && !pathname?.includes('/register') ? (
              <div className="flex items-center space-x-2 border-l pl-6 ml-6">
                <Button asChild>
                  <Link href="/login">Ingresar</Link>
                </Button>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2 border-l pl-6 ml-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                      <Avatar className="h-full w-full border border-border shadow-sm transition-transform hover:scale-105">
                        <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.name || 'Mi Cuenta'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notificaciones</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>
        <div className="flex flex-1 items-center justify-end md:hidden">
          {!user ? (
            <div className="flex items-center">
              {!pathname?.includes('/login') && !pathname?.includes('/register') && (
                <Button asChild variant="ghost" size="sm" className="font-bold text-primary">
                  <Link href="/login">Ingresar</Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Link href="/profile" className="mr-4">
                 <Avatar className="h-8 w-8 border border-border transition-transform active:scale-95">
                  <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-5 mt-14">
                    <nav className="flex flex-col space-y-4">
                      {role === 'employer' ? (
                        <>
                          <SheetClose asChild><Link href="/employer/dashboard" className="text-lg font-medium">Portal Emprendedor</Link></SheetClose>
                          <SheetClose asChild><Link href="/profile" className="text-lg font-medium">Mi Perfil</Link></SheetClose>
                          <SheetClose asChild><Link href="/notifications" className="text-lg font-medium">Notificaciones</Link></SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild><Link href="/jobs" className="text-lg font-medium">Trabajos</Link></SheetClose>
                          <SheetClose asChild><Link href="/profile" className="text-lg font-medium">Mi Perfil</Link></SheetClose>
                          <SheetClose asChild><Link href="/notifications" className="text-lg font-medium">Notificaciones</Link></SheetClose>
                        </>
                      )}
                    </nav>
                    <div className="h-px bg-border my-2" />
                    <SheetClose asChild>
                      <button onClick={handleLogout} className="text-lg font-medium text-left text-destructive flex w-full">
                        Cerrar Sesión
                      </button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
