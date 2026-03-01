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
}

export function ChatUI({ chatId, currentUserId, initialMessages }: ChatUIProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = React.useState('')
  const [isSending, setIsSending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  React.useEffect(() => {
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
    }
  }, [chatId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const tempId = crypto.randomUUID()
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
    setIsSending(true)

    try {
      await sendMessage(chatId, content)
    } catch (error) {
      toast.error('Error al enviar el mensaje')
      // Revert optimistic update on failure
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full relative bg-muted/10">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 opacity-50" />
            </div>
            <div>
              <p className="font-medium text-lg text-foreground">Aún no hay mensajes</p>
              <p className="text-sm">Envía el primer mensaje para iniciar la conversación.</p>
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

      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-3 pb-8 sm:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-end relative">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..." 
            className="h-14 bg-card rounded-2xl pr-14 pl-5 shadow-sm border-border/50 text-[15px] resize-none focus-visible:ring-1"
            disabled={isSending}
            autoComplete="off"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || isSending}
            className="absolute right-2 bottom-2 h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-sm"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
