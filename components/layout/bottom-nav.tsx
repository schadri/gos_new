import Link from 'next/link'
import { Home, Search, Briefcase, Bell, User } from 'lucide-react'

export function BottomNav() {
  return (
    <div className="fixed bottom-0 z-50 w-full border-t bg-background pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
          <Home className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>
        <Link href="/jobs" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
          <Search className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Buscar</span>
        </Link>
        <Link href="/employer/post-job" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
          <div className="bg-primary text-primary-foreground p-3 rounded-full -mt-6 shadow-lg transform hover:scale-105 transition-transform">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-primary mt-1">Publicar</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors relative">
          <Bell className="h-5 w-5 mb-1" />
          <span className="absolute top-2 right-4 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          <span className="text-[10px] font-medium">Notifs</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
          <User className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </div>
  )
}
