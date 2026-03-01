'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ApplyButtonProps {
  jobId: string
  userId?: string
  isEmployer: boolean
  hasApplied: boolean
}

export function ApplyButton({ jobId, userId, isEmployer, hasApplied: initialApplied }: ApplyButtonProps) {
  const [isApplying, setIsApplying] = React.useState(false)
  const [hasApplied, setHasApplied] = React.useState(initialApplied)

  const handleApply = async () => {
    if (!userId) {
      toast.error('Debes iniciar sesión para postularte.')
      return
    }

    if (isEmployer) {
      toast.error('Los perfiles de empresa no pueden postularse a ofertas.')
      return
    }

    try {
      setIsApplying(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: userId,
          status: 'pending'
        })

      if (error) {
        // Handle unique constraint violation (already applied) gracefully
        if (error.code === '23505') {
          setHasApplied(true)
          toast.info('Ya te habías postulado a esta oferta.')
          return
        }
        throw error
      }

      // Increment the application count using the existing RPC
      const { error: rpcError } = await supabase.rpc('increment_job_applications', {
        job_uuid: jobId
      })

      if (rpcError) {
        console.error('Error incrementing application count:', rpcError)
      }

      setHasApplied(true)
      toast.success('¡Te has postulado exitosamente!')
      
    } catch (error: any) {
      toast.error('Ocurrió un error al postularte. Intenta nuevamente.')
      console.error(error)
    } finally {
      setIsApplying(false)
    }
  }

  if (isEmployer) {
    return (
      <Button size="lg" disabled variant="outline" className="w-full h-16 rounded-2xl text-xl font-bold">
        Eres Emprendedor
      </Button>
    )
  }

  if (hasApplied) {
    return (
      <Button size="lg" disabled variant="secondary" className="w-full h-16 rounded-2xl text-xl font-bold bg-green-500/10 text-green-700 dark:text-green-500 hover:bg-green-500/10 opacity-100">
        Ya te has postulado
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleApply}
      disabled={isApplying}
      size="lg" 
      className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform relative overflow-hidden group"
    >
      {isApplying ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <>
          <div className="absolute inset-0 bg-white/20 w-1/2 transform skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative z-10">Postularme Ahora</span>
        </>
      )}
    </Button>
  )
}
