'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasExchanged = useRef(false)

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/'

      if (hasExchanged.current) {
        console.log('[AuthCallback] Exchange already in progress or completed, skipping...')
        return
      }
      
      hasExchanged.current = true

      const supabase = createClient()
      
      try {
        let sessionUser = null;

        console.log('[AuthCallback] Waiting for Supabase to auto-exchange the URL tokens...')
        
        // Wait for Supabase's automatic URL parsing (PKCE network exchange or Implicit hash parse)
        sessionUser = await new Promise<any>((resolve) => {
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              authListener.subscription.unsubscribe();
              resolve(session.user);
            }
          });
          
          // Fallback: check immediately in case it finished before the listener attached
          supabase.auth.getSession().then(({ data }) => {
            if (data?.session) {
              authListener.subscription.unsubscribe();
              resolve(data.session.user);
            }
          });

          // Global timeout of 10 seconds
          setTimeout(() => {
            authListener.subscription.unsubscribe();
            resolve(null);
          }, 10000);
        });

        if (!sessionUser) {
          setStatus('error')
          const currentHref = typeof window !== 'undefined' ? window.location.href : 'SSR';
          setErrorMessage(`Supabase auto-exchange failed or timed out. Auth URL: ${currentHref}`)
          return
        }

        if (sessionUser) {
          console.log('[AuthCallback] Session established! User:', sessionUser.email)
          setStatus('success')
          
          // Determine redirect based on user type (simplified logic)
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', sessionUser.id)
            .maybeSingle()

          let finalRedirect = next
          if (profile) {
            const existingRole = (profile as any).user_type
            
            // Fallback intent checking
            const localIntent = typeof window !== 'undefined' ? localStorage.getItem('role_intent') : null;
            const intendedRegisterEmployer = next.includes('/employer/register') || localIntent === 'employer';
            const intendedRegisterTalent = next.includes('/talent/register') || localIntent === 'talent';

            if (existingRole === 'TALENT' && intendedRegisterEmployer) {
                console.log('[AuthCallback] Cross-role violation (TALENT -> BUSINESS)')
                await supabase.auth.signOut()
                if (typeof window !== 'undefined') localStorage.removeItem('role_intent')
                router.push('/login?error=rol_invalido_emprendedor')
                return
            } else if (existingRole === 'BUSINESS' && intendedRegisterTalent) {
                console.log('[AuthCallback] Cross-role violation (BUSINESS -> TALENT)')
                await supabase.auth.signOut()
                if (typeof window !== 'undefined') localStorage.removeItem('role_intent')
                router.push('/login?error=rol_invalido_postulante')
                return
            }

            finalRedirect = existingRole === 'BUSINESS' ? '/employer/dashboard' : '/jobs'
            if (typeof window !== 'undefined') localStorage.removeItem('role_intent')
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
