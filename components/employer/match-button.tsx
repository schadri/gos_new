'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MatchButtonProps {
  applicationId: string
  jobId: string
  applicantName: string
  initialStatus: string
}

export function MatchButton({ applicationId, jobId, applicantName, initialStatus }: MatchButtonProps) {
  const [isMatching, setIsMatching] = React.useState(false)
  const [hasMatched, setHasMatched] = React.useState(initialStatus === 'interview')
  const router = useRouter()

  const handleMatch = async () => {
    try {
      setIsMatching(true)
      const supabase = createClient()
      
      // Update application status to interview
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status: 'interview' })
        .eq('id', applicationId)

      if (updateError) throw updateError

      // Increment contacted count via RPC
      const { error: rpcError } = await supabase.rpc('increment_job_contacted_count', {
        job_uuid: jobId
      })

      if (rpcError) {
        console.error('Error incrementing contacted count:', rpcError)
        // We do not throw because the match still occurred successfully from the applicant's side
      }

      setHasMatched(true)
      toast.success(`¡Has hecho Match con ${applicantName}!`)
      router.refresh()
      
    } catch (error: any) {
      toast.error('Ocurrió un error al intentar contactar. Intenta nuevamente.')
      console.error(error)
    } finally {
      setIsMatching(false)
    }
  }

  if (hasMatched) {
    return (
      <Button 
        variant="secondary" 
        className="w-full h-12 rounded-xl text-base font-bold bg-green-500/10 text-green-700 hover:bg-green-500/20"
        onClick={() => router.push('/chat')}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Ir al Chat
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleMatch}
      disabled={isMatching}
      size="default" 
      className="w-full h-12 rounded-xl text-base font-bold shadow-md hover:-translate-y-0.5 transition-transform"
    >
      {isMatching ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Hacer Match
        </>
      )}
    </Button>
  )
}
