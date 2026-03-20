'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/'
      
      if (!code) {
        setStatus('error')
        setErrorMessage('No code found in URL')
        return
      }

      const supabase = createClient()
      
      try {
        console.log('[AuthCallback] Exchanging code for session...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('[AuthCallback] Exchange error:', error)
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        if (data.session) {
          console.log('[AuthCallback] Session established! User:', data.user?.email)
          setStatus('success')
          
          // Determine redirect based on user type (simplified logic)
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', data.user.id)
            .maybeSingle()

          let finalRedirect = next
          if (profile) {
             finalRedirect = (profile as any).user_type === 'BUSINESS' ? '/employer/dashboard' : '/jobs'
          }

          router.push(finalRedirect)
        }
      } catch (err: any) {
        console.error('[AuthCallback] Unexpected error:', err)
        setStatus('error')
        setErrorMessage(err.message || 'An unexpected error occurred')
      }
    }

    exchangeCode()
  }, [searchParams, router])

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="p-6 max-w-md w-full bg-destructive/10 border border-destructive rounded-lg text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Error de Autenticación</h1>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">Procesando inicio de sesión...</h1>
        <p className="text-muted-foreground italic">Por favor, no cierres la ventana.</p>
      </div>
    </div>
  )
}
