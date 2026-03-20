'use client'

import * as React from 'react'
import { ArrowLeft, MoreVertical, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteChat, togglePauseChat } from '@/app/actions/chat'
import { ChatUI } from './chat-interface'

interface ChatViewProps {
  chatId: string
  user: any
  chat: any
  isEmployer: boolean
  displayName: string
  displayAvatar: string | null
  initialMessages: any[]
  isPaused: boolean
}

export function ChatView({ 
  chatId, 
  user, 
  chat, 
  isEmployer, 
  displayName, 
  displayAvatar, 
  initialMessages,
  isPaused: initialIsPaused
}: ChatViewProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(initialIsPaused)

  const chatHeader = React.useMemo(() => (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar className="h-10 w-10 border border-border">
        <AvatarImage src={displayAvatar || ''} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">{displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h2 className="font-bold truncate text-base">{displayName}</h2>
        <p className="text-xs text-muted-foreground truncate">{chat.job?.title} en {chat.job?.company}</p>
      </div>
    </div>
  ), [displayAvatar, displayName, chat.job?.title, chat.job?.company])

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteChat(chatId)
      toast.success('Match deshecho exitosamente')
      router.push('/employer/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePause = async () => {
    setLoading(true)
    try {
      await togglePauseChat(chatId, !isPaused)
      toast.success(isPaused ? 'Chat reactivado' : 'Chat pausado')
      setIsPaused(!isPaused)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-background">
      <div className="sticky top-16 border-b bg-card w-full shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link 
              href={isEmployer ? '/employer/dashboard' : '/profile'} 
              className="p-2 hover:bg-muted rounded-full transition-colors flex shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {chatHeader}
          </div>

          {isEmployer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MoreVertical className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem onClick={handleTogglePause} className="cursor-pointer font-medium">
                  {isPaused ? 'Reactivar Chat' : 'Pausar Chat'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      Deshacer Match
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[90%] max-w-[400px] rounded-3xl p-6 sm:p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-center">¿Deshacer Match?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center text-muted-foreground mt-2">
                        Esta acción no se puede deshacer. Se eliminará el chat y todo el historial de mensajes para ambas partes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
                      <AlertDialogCancel className="w-full sm:w-1/2 h-12 rounded-xl font-medium mt-0">Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="w-full sm:w-1/2 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
                      >
                        Deshacer Match
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <ChatUI 
          chatId={chatId} 
          currentUserId={user.id} 
          initialMessages={initialMessages} 
          isEmployer={isEmployer}
          isPaused={isPaused}
        />
      </div>
    </div>
  )
}
