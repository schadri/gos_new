import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Briefcase, User, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">GOS</span>
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">Trabajos</Link>
            <Link href="/employer/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Soy Emprendedor</Link>
          </nav>
          <div className="flex items-center space-x-2 border-l pl-6 ml-6">
            <Button variant="ghost" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button asChild>
              <Link href="/talent/register">Postularme</Link>
            </Button>
          </div>
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
                <Link href="/jobs" className="text-lg font-medium">Trabajos</Link>
                <Link href="/employer/dashboard" className="text-lg font-medium">Soy Emprendedor</Link>
                <div className="h-px bg-border my-2" />
                <Link href="/login" className="text-lg font-medium">Ingresar</Link>
                <Link href="/talent/register" className="text-lg font-medium text-primary">Postularme</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
