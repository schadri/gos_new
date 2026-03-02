
'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function RoleRedirector() {
  const router = useRouter()

  React.useEffect(() => {
    const checkRedirection = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        console.log('RoleRedirector: Session found, checking profile...')
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()

        const intent = localStorage.getItem('role_intent')
        console.log(`RoleRedirector: Profile type: ${profile?.user_type}, Intent: ${intent}`)

        if (profile?.user_type === 'BUSINESS') {
          router.replace('/employer/dashboard')
          return
        }

        if (profile?.user_type === 'TALENT') {
          // If the profile says TALENT but they JUST intended to be an employer, resolve the conflict
          if (intent === 'employer') {
            console.log('RoleRedirector: Conflict detected! Profile is TALENT but intent was Employer. Fixing...')
            await supabase.from('profiles').update({ user_type: 'BUSINESS' }).eq('id', session.user.id)
            localStorage.removeItem('role_intent')
            router.replace('/employer/register')
          } else {
            router.replace('/jobs')
          }
          return
        }
        
        // If profile not found but session exists, maybe highly new user
        if (!profile && intent === 'employer') {
            router.replace('/employer/register')
        } else if (!profile && intent === 'talent') {
            router.replace('/talent/register')
        }
      }
    }

    checkRedirection()
  }, [router])

  return null
}
