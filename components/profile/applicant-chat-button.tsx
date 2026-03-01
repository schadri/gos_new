'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getOrCreateChat } from '@/app/actions/chat'
import { toast } from 'sonner'

interface ApplicantChatButtonProps {
  jobId: string
  applicantId: string
}

export function ApplicantChatButton({ jobId, applicantId }: ApplicantChatButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleOpenChat = async () => {
    try {
      setIsLoading(true)
      const chatId = await getOrCreateChat(jobId, applicantId)
      router.push(`/chat/${chatId}`)
    } catch (error) {
      toast.error('Ocurrió un error al abrir el chat')
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleOpenChat}
      disabled={isLoading}
      variant="outline" 
      size="sm" 
      className="mt-4 sm:mt-0 font-bold border-primary/40 text-primary hover:bg-primary/10 rounded-xl w-full sm:w-auto shadow-sm"
    >
      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
      Ir al Chat
    </Button>
  )
}
