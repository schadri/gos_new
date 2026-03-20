'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { sendMessage } from '@/app/actions/chat'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface ChatUIProps {
  chatId: string
  currentUserId: string
  initialMessages: any[]
  isEmployer: boolean
  isPaused?: boolean
}

export function ChatUI({ chatId, currentUserId, initialMessages, isEmployer, isPaused: initialIsPaused = false }: ChatUIProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [isPaused, setIsPaused] = React.useState(initialIsPaused)
  const [newMessage, setNewMessage] = React.useState('')
  const [isSending, setIsSending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [supabase] = React.useState(() => createClient())

  const scrollToBottom = React.useCallback(() => {
    // Use block: 'end' with preventScroll-safe approach to avoid stealing focus from input on mobile
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  React.useEffect(() => {
    setIsPaused(initialIsPaused)
  }, [initialIsPaused])

  React.useEffect(() => {
    const clearNotifs = async () => {
      const { markChatNotificationsAsRead } = await import('@/app/actions/notifications')
      await markChatNotificationsAsRead(chatId)
    }
    clearNotifs()
  }, [chatId])

  React.useEffect(() => {
    // Subscribe to chat status changes
    const chatChannel = supabase
      .channel(`chat_status_${chatId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chats',
        filter: `id=eq.${chatId}`
      }, (payload) => {
        if (payload.new && 'is_paused' in payload.new) {
          setIsPaused(!!payload.new.is_paused)
        }
      })
      .subscribe()

    // Subscribe to new messages using real-time channel
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}` 
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages((prev) => {
          // Prevent duplicates if we already added it optimistically
          if (prev.find(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(chatChannel)
    }
  }, [chatId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending || isPaused) return

    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const content = newMessage.trim()
    
    // Optimistic UI update
    const optimisticMessage: Message = {
      id: tempId,
      content,
      sender_id: currentUserId,
      created_at: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    // Re-focus input after sending
    requestAnimationFrame(() => inputRef.current?.focus())
    setIsSending(true)

    try {
      const response = await sendMessage(chatId, content, tempId)
      if (response && response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al enviar el mensaje'
      toast.error(errorMsg)
      // If we receive the specific paused error, we can also force the UI to pause
      if (errorMsg.includes('pausado')) {
        setIsPaused(true)
      }
      // Revert optimistic update on failure
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full relative bg-muted/10">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground/60 p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 opacity-50" />
              </div>
              <div>
                <p className="font-medium text-lg text-foreground">Aún no hay mensajes</p>
                <p className="text-sm">
                  {isEmployer 
                    ? 'Envía el primer mensaje para iniciar la conversación.'
                    : 'Espera a que la empresa inicie la conversación para responder.'}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId
              return (
                <div 
                  key={msg.id} 
                  className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-card border border-border/50 text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">{msg.content}</p>
                    <span className={`text-[11px] font-medium block mt-2 ${isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-3 pb-safe-bottom sm:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 mt-auto">
        {isPaused ? (
          <div className="max-w-4xl mx-auto py-4 px-6 bg-muted/50 rounded-2xl border border-dashed border-border/60 text-center">
            <p className="text-sm font-bold text-muted-foreground italic flex items-center justify-center gap-2">
              {isEmployer ? 'Has pausado este chat. Los candidatos no podrán enviar mensajes.' : 'Este chat ha sido pausado por el emprendedor.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-end relative">
            <Input 
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={!isEmployer && messages.length === 0 ? "Espera el primer mensaje..." : "Escribe un mensaje..."} 
              className="h-14 bg-card rounded-2xl pr-14 pl-5 shadow-sm border-border/50 text-[15px] resize-none focus-visible:ring-1 disabled:opacity-60"
              disabled={isSending || (!isEmployer && messages.length === 0)}
              autoComplete="off"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newMessage.trim() || isSending || (!isEmployer && messages.length === 0)}
              className="absolute right-2 bottom-2 h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-sm disabled:opacity-50"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
