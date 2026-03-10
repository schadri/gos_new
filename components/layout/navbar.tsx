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
import { User, Menu, LogOut, Bell, LifeBuoy } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { getAvatarUrl } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const [role, setRole] = React.useState<string | null>(null)
  const [profile, setProfile] = React.useState<{ name?: string, avatar?: string } | null>(null)
  const [unreadCount, setUnreadCount] = React.useState(0)
  
  const fetchUnreadCount = React.useCallback(async (userId: string) => {
    const supabase = createClient()
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (count !== null) {
      setUnreadCount(count)
    }
  }, [])
  
  React.useEffect(() => {
    const supabase = createClient()
    
    const fetchUserAndRole = async () => {
      try {
        const withTimeout = (promise: Promise<any>, ms: number) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), ms))
          ])
        }

        // getSession() reads from cookie/localStorage — no network call, instant.
        // The middleware already validates security on protected routes.
        const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession(), 3000)
        
        if (sessionError || !session?.user) {
          setUser(null)
          setRole(null)
          setProfile(null)
          return
        }

        const authUser = session.user
        setUser(authUser)
        
        // Fetch unread count
        fetchUnreadCount(authUser.id)
        
        // First check metadata for immediate role detection
        let currentRole = authUser.user_metadata?.role
        
        // Then verify with the database and get profile info
        const { data: profileData, error: profileError } = await (supabase
          .from('profiles') as any)
          .select('user_type, full_name, profile_photo, company_logo')
          .eq('id', authUser.id)
          .maybeSingle()
          
        if (profileData && !profileError) {
          const profile = profileData as any
          if (profile.user_type === 'BUSINESS') {
            currentRole = 'employer'
          } else if (profile.user_type === 'TALENT') {
            currentRole = 'talent'
          }
          
          setRole(currentRole)
          setProfile({
            name: profile.full_name,
            avatar: getAvatarUrl(
              profile.user_type === 'BUSINESS' ? profile.company_logo : profile.profile_photo
            ) || undefined
          })
        } else {
          setRole(currentRole)
        }
      } catch (err) {
        console.error('Navbar: Error fetching user/role:', err)
      }
    }

    // Initial fetch
    fetchUserAndRole()

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Navbar: Auth state changed:', event)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        fetchUserAndRole()
      }
    })

    // Listen for realtime notifications
    const channel = supabase.channel('navbar-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
         if (user?.id) fetchUnreadCount(user.id)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [fetchUnreadCount, user?.id])

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
          <Image src="/logo.png" alt="GOS Logo" width={60} height={60} className="object-contain" />
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user || !isPublicRoute ? (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <ThemeToggle />
              {role === 'employer' ? (
                <>
                  <Link href="/employer/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Portal Emprendedor</Link>
                  <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center group">
                    <Bell className="h-5 w-5 text-foreground/60 group-hover:text-foreground/80 transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/support" className="transition-colors hover:text-foreground/80 text-foreground/60">Soporte</Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">Trabajos</Link>
                  <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center group">
                    <Bell className="h-5 w-5 text-foreground/60 group-hover:text-foreground/80 transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/support" className="transition-colors hover:text-foreground/80 text-foreground/60">Soporte</Link>
                </>
              )}
            </nav>
          ) : (
            <div className="flex-1 flex items-center justify-end gap-4 pr-4">
              <ThemeToggle />
              <Link href="/support" className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60">Soporte</Link>
            </div>
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
                        <AvatarImage src={getAvatarUrl(profile?.avatar) || ''} alt={profile?.name || 'User'} />
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
                      <Link href="/notifications" className="cursor-pointer w-full flex items-center">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notificaciones</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
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
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {!pathname?.includes('/login') && !pathname?.includes('/register') && (
                <>
                  <Button asChild variant="ghost" size="sm" className="font-medium text-muted-foreground">
                    <Link href="/support">Soporte</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="font-bold text-primary">
                    <Link href="/login">Ingresar</Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/profile" className="mr-4">
                 <Avatar className="h-8 w-8 border border-border transition-transform active:scale-95">
                  <AvatarImage src={getAvatarUrl(profile?.avatar) || ''} alt={profile?.name || 'User'} />
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
                <SheetContent side="right" className="bg-background/100 backdrop-blur-md">
                  <div className="flex flex-col h-full mt-14 pb-8">
                    <div className="flex w-full justify-center pb-6">
                      <ThemeToggle />
                    </div>
                    <nav className="flex flex-col flex-1 items-center space-y-6">
                      {role === 'employer' ? (
                        <>
                          <SheetClose asChild><Link href="/employer/dashboard" className="text-lg font-medium text-center">Portal Emprendedor</Link></SheetClose>
                          <SheetClose asChild><Link href="/profile" className="text-lg font-medium text-center">Mi Perfil</Link></SheetClose>
                          <SheetClose asChild>
                            <Link href="/notifications" className="text-lg font-medium flex items-center justify-center gap-2">
                              Notificaciones
                              {unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                  {unreadCount}
                                </span>
                              )}
                            </Link>
                          </SheetClose>
                          <SheetClose asChild><Link href="/support" className="text-lg font-medium text-center">Soporte</Link></SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild><Link href="/jobs" className="text-lg font-medium text-center">Trabajos</Link></SheetClose>
                          <SheetClose asChild><Link href="/profile" className="text-lg font-medium text-center">Mi Perfil</Link></SheetClose>
                          <SheetClose asChild>
                            <Link href="/notifications" className="text-lg font-medium flex items-center justify-center gap-2">
                              Notificaciones
                              {unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                  {unreadCount}
                                </span>
                              )}
                            </Link>
                          </SheetClose>
                          <SheetClose asChild><Link href="/support" className="text-lg font-medium text-center">Soporte</Link></SheetClose>
                        </>
                      )}
                    </nav>
                    <div className="mt-auto pt-4 border-t">
                      <SheetClose asChild>
                        <button onClick={handleLogout} className="text-lg font-medium justify-center text-red-700 flex w-full">
                          Cerrar Sesión
                        </button>
                      </SheetClose>
                    </div>
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
