'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/users', icon: Users },
  { label: 'Trabajos', href: '/admin/jobs', icon: Briefcase },
  { label: 'Ajustes', href: '/admin/settings', icon: Settings },
]

export function AdminNav({ className, onItemClick }: { className?: string, onItemClick?: () => void }) {
  const pathname = usePathname()
  
  return (
    <nav className={cn("flex-1 p-4 space-y-2", className)}>
      {NAV_ITEMS.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
            pathname === item.href 
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className={cn(
            "h-5 w-5",
            pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"
          )} />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-64 border-r bg-card flex-col sticky top-0 h-screen shadow-sm">
      <div className="p-6 border-b flex items-center gap-3 bg-primary/5">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="font-extrabold text-lg tracking-tight">Admin Portal</span>
      </div>
      
      <AdminNav />

      <div className="p-4 border-t space-y-4">
        <Button variant="outline" className="w-full justify-start gap-2 rounded-xl border-border/60" asChild>
          <Link href="/">
            <ChevronLeft className="h-4 w-4" /> Volver a la App
          </Link>
        </Button>
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estado</p>
          <p className="text-xs font-bold text-green-500 flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Conexión Segura
          </p>
        </div>
      </div>
    </aside>
  )
}
