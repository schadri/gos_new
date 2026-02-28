import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Briefcase } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] p-8 border rounded-2xl bg-card shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bienvenido de nuevo</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email y contraseña para entrar a tu cuenta.
          </p>
        </div>
        <div className="grid gap-6">
          <form>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="nombre@ejemplo.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  className="bg-muted/40"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-muted/40"
                />
              </div>
              <Button type="button" size="lg" className="w-full font-medium mt-2 text-md">
                Ingresar
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-card px-3 text-muted-foreground">
                ¿Aún no tienes cuenta?
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" asChild className="hover:bg-primary/5 hover:text-primary transition-colors border-muted-foreground/30">
              <Link href="/talent/register">Soy Postulante</Link>
            </Button>
            <Button variant="outline" asChild className="hover:bg-primary/5 hover:text-primary transition-colors border-muted-foreground/30">
              <Link href="/employer/register">Soy Emprendedor</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
