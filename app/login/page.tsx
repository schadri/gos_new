'use client'

import * as React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isTauri } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import { openUrl } from '@tauri-apps/plugin-opener'
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const flow = searchParams?.get('flow')
  const isTauriFlow = flow === 'talent'

  React.useEffect(() => {
    console.log("Login Mounted. isTauri() =", isTauri())
    
    // Check for specific cross-role errors coming from OAuth callbacks
    const errorParam = searchParams?.get('error')
    if (errorParam === 'rol_invalido_emprendedor') {
      toast.error('Ya tienes una cuenta registrada como postulante. Por favor, inicia sesión y elimina tu cuenta para registrarte como emprendedor.', { duration: 6000 })
    } else if (errorParam === 'rol_invalido_postulante') {
      toast.error('Ya tienes una cuenta registrada como emprendedor. Por favor, inicia sesión y elimina tu cuenta para registrarte como postulante.', { duration: 6000 })
    }
  }, [searchParams])

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // Wait for deep link when clicking Google Login
  React.useEffect(() => {
    let unlisten: () => void;
    
    const setupDeepLink = async () => {
      try {
        if (isTauri()) {
          unlisten = await onOpenUrl((urls: string[]) => {
            console.log('Deep link received:', urls);
            if (urls.length > 0) {
              const url = urls[0];
              // El callback de Supabase vuelve con el fragmento #access_token=... o ?code=...
              // Extraer ruta relativa asumiendo que empieza con gos://
              if (url.startsWith('gos://')) {
                const relativePath = url.replace('gos://', '/');
                router.push(relativePath);
              }
            }
          });
        }
      } catch (err) {
        console.error('Failed to setup deep link listener:', err);
      }
    };

    setupDeepLink();
    return () => {
      if (unlisten) unlisten();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    const supabase = createClient()

    let nextRoute = '/'
    const typeValue = flow === 'employer' ? 'BUSINESS' : 'TALENT'
    
    // Safety for mobile: Save intent to localStorage
    if (flow) {
      console.log(`Login: Saving role intent ${flow} to localStorage`)
      localStorage.setItem('role_intent', flow)
    }

    if (flow === 'talent') nextRoute = '/talent/register'
    if (flow === 'employer') nextRoute = '/employer/register'

    const redirectUrl = isTauri() 
      ? `gos://auth/callback`
      : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`

    console.log(`Login: redirectUrl targeted = ${redirectUrl}`)

    console.log(`Login: Starting Google OAuth with next=${nextRoute}`)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account',
        },
        skipBrowserRedirect: isTauri(),
      },
    })

    if (error) {
      console.error('Login: Google OAuth Error:', error)
      toast.error(`Error al conectar con Google: ${error.message}`)
      return;
    }

    if (isTauri() && data?.url) {
      // Abre en el navegador por defecto del sistema
      try {
        console.log("Login: Tauri detected, opening external browser", data.url)
        await openUrl(data.url);
      } catch (err) {
        console.error('Failed to open external browser:', err);
        toast.error('No se pudo abrir el navegador externo');
      }
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      if (flow) {
        if (password !== confirmPassword) {
          toast.error('Las contraseñas no coinciden')
          return
        }

        const typeValue = flow === 'employer' ? 'BUSINESS' : 'TALENT'

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              role: flow,
              user_type: typeValue
            } 
          },
        })

        if (error) {
          toast.error(error.message)
          return
        }

        toast.success('¡Registro exitoso!')
        if (flow === 'talent') router.push('/talent/register')
        if (flow === 'employer') router.push('/employer/register')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error('Credenciales incorrectas')
          return
        }

        toast.success('¡Bienvenido!')
        const role = data.user.user_metadata?.role
        if (role === 'employer') router.push('/employer/dashboard')
        else router.push('/jobs')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container mx-auto flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center ${isTauriFlow ? 'talent-theme' : ''}`}>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] p-8 border rounded-2xl bg-card shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {flow === 'talent'
              ? 'Regístrate como Postulante'
              : flow === 'employer'
              ? 'Regístrate como Emprendedor'
              : 'Bienvenido de nuevo'}
          </h1>
        </div>

        <form onSubmit={handleEmailAuth} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              {!flow && (
                <Link
                  href="/login/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
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
                required
              />
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : flow ? 'Registrarse' : 'Ingresar'}
          </Button>

          <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Ingresar con Google
          </Button>
        </form>
      </div>

      <div className="text-center mt-8 w-full max-w-[400px]">
        {!flow && (
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
            ¿Todavía no tenés una cuenta?
          </h2>
        )}
        <div className={`grid ${!flow ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {(flow === 'employer' || !flow) && (
            <div className="talent-theme">
              <Button variant="outline" asChild className="h-14 w-full rounded-2xl border-primary/20 hover:border-primary/50 hover:bg-primary/5 shadow-sm bg-card">
                <Link href="/login?flow=talent" className="text-sm font-bold">Soy Postulante</Link>
              </Button>
            </div>
          )}
          {(flow === 'talent' || !flow) && (
            <Button variant="outline" asChild className="h-14 rounded-2xl border-primary/20 hover:border-primary/50 hover:bg-primary/5 shadow-sm bg-card">
              <Link href="/login?flow=employer" className="text-sm font-bold">Soy Emprendedor</Link>
            </Button>
          )}
          
        </div>
        
        {flow && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/login">Volver al ingreso normal</Link>
            </Button>
          </div>
        )}
      </div>
    </div>

  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginContent />
    </Suspense>
  )
}