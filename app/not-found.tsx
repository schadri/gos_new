import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-card dark:bg-zinc-900/90 border border-border rounded-3xl shadow-xl backdrop-blur-sm">
        <div className="flex justify-center">
          <div className="relative">
            <h1 className="text-9xl font-extrabold text-primary/20 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-20 w-20 text-primary drop-shadow-md" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Página no encontrada</h2>
          <p className="text-muted-foreground font-medium">
            Lo sentimos, no pudimos encontrar la ruta que estás buscando. Puede que haya sido movida o eliminada.
          </p>
        </div>

        <div className="pt-6">
          <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold shadow-md shadow-primary/20">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
