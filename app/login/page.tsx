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
import { toast } from 'sonner'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const flow = searchParams?.get('flow')

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleGoogleLogin = async () => {
    const supabase = createClient()

    let nextRoute = '/profile'
    if (flow === 'talent') nextRoute = '/talent/register'
    if (flow === 'employer') nextRoute = '/employer/register'

    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    })
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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: flow } },
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
            <Label htmlFor="password">Contraseña</Label>
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

          <Button type="button" variant="outline" onClick={handleGoogleLogin}>
            Ingresar con Google
          </Button>
        </form>
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