'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import * as React from 'react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const flow = searchParams?.get('flow') // 'talent' or 'employer'

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    
    // Determinamos la URL final a donde irá el usuario luego de autenticarse
    let nextRoute = '/profile'
    if (flow === 'talent') nextRoute = '/talent/register'
    if (flow === 'employer') nextRoute = '/employer/register'
    
    // Se enviará a la API route de callback de Supabase para generar las cookies
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      if (flow) { // Modo Registro
        if (password !== confirmPassword) {
          toast.error('Las contraseñas no coinciden')
          return
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: flow } // talent | employer
          }
        })

        if (error) {
          toast.error(error.message)
          return
        }

        toast.success('¡Registro exitoso! Revisa tu email para confirmarlo (si aplica) o continúa.')
        if (flow === 'talent') router.push('/talent/register')
        if (flow === 'employer') router.push('/employer/register')
        
      } else { // Modo Inicio de Sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error('Credenciales incorrectas')
          return
        }
        
        toast.success('¡Bienvenido de nuevo!')
        
        // Redirigimos basándonos en el rol si existe, si no a /profile por defecto
        const role = data.user.user_metadata?.role
        if (role === 'talent') router.push('/profile')
        else if (role === 'employer') router.push('/employer/dashboard')
        else router.push('/profile')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] p-8 border rounded-2xl bg-card shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {flow === 'talent' ? 'Regístrate como Postulante' : flow === 'employer' ? 'Regístrate como Emprendedor' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {flow ? 'Crea tu cuenta con email y contraseña.' : 'Ingresa tu email y contraseña para entrar a tu cuenta.'}
          </p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleEmailAuth}>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  className="bg-muted/40"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="bg-muted/40"
                  required
                />
              </div>
              {flow && (
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Repetir Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    className="bg-muted/40"
                    required
                  />
                </div>
              )}
              <Button type="submit" size="lg" className="w-full font-medium mt-2 text-md" disabled={loading}>
                {loading ? 'Cargando...' : flow ? 'Registrarse' : 'Ingresar'}
              </Button>
              <Button 
                onClick={handleGoogleLogin} 
                type="button" 
                variant="outline" 
                size="lg" 
                className="w-full font-bold text-md bg-background border-border/60 shadow-sm hover:bg-muted/50 gap-2"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Ingresar con Google
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-card px-3 text-muted-foreground">
                {flow ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
              </span>
            </div>
          </div>
          <div className={`grid ${flow ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {flow ? (
              <Button variant="outline" asChild className="hover:bg-primary/5 hover:text-primary transition-colors border-muted-foreground/30">
                <Link href="/login">Ingresar a mi cuenta</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild className="hover:bg-primary/5 hover:text-primary transition-colors border-muted-foreground/30">
                  <Link href="/login?flow=talent">Soy Postulante</Link>
                </Button>
                <Button variant="outline" asChild className="hover:bg-primary/5 hover:text-primary transition-colors border-muted-foreground/30">
                  <Link href="/login?flow=employer">Soy Emprendedor</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
