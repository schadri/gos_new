'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Briefcase, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/login/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setSubmitted(true)
      toast.success('Se ha enviado un correo para restablecer tu contraseña')
    } catch (error) {
      toast.error('Ocurrió un error inesperado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8 border rounded-2xl bg-card shadow-sm text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Revisá tu correo</h1>
          <p className="text-sm text-muted-foreground">
            Hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] p-8 border rounded-2xl bg-card shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Recuperar contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Ingresá tu email y te enviaremos un link para crear una nueva contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Button>

          <Button variant="ghost" asChild className="text-sm">
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al ingreso
            </Link>
          </Button>
        </form>
      </div>
    </div>
  )
}
