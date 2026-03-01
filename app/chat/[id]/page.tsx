import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatUI } from '@/components/chat/chat-interface'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch chat details
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select(`
      *,
      job:jobs(title, company)
    `)
    .eq('id', id)
    .single()

  if (chatError || !chat) {
    notFound()
  }

  // Ensure user is part of chat
  if (chat.employer_id !== user.id && chat.applicant_id !== user.id) {
    redirect('/dashboard')
  }

  const typedChat = chat as any

  // Determine the other participant
  const otherUserId = chat.employer_id === user.id ? chat.applicant_id : chat.employer_id
  const isEmployer = chat.employer_id === user.id

  // Fetch the other participant's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, profile_photo, company_name, company_logo')
    .eq('id', otherUserId)
    .single()

  const displayName = isEmployer 
    ? (profile?.full_name || 'Candidato')
    : (profile?.company_name || profile?.full_name || 'Empresa')

  const displayAvatar = isEmployer
    ? profile?.profile_photo
    : (profile?.company_logo || profile?.profile_photo)

  // Fetch Initial messages
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] overflow-hidden bg-background">
      <div className="border-b bg-card px-4 py-3 flex items-center gap-4 shrink-0 shadow-sm z-20">
        <Link 
          href={isEmployer ? '/employer/dashboard' : '/profile'} 
          className="p-2 hover:bg-muted rounded-full transition-colors flex shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 shrink-0 overflow-hidden flex items-center justify-center">
             {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
             ) : (
                <span className="text-lg font-bold text-primary">{displayName.charAt(0)}</span>
             )}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold truncate text-base">{displayName}</h2>
            <p className="text-xs text-muted-foreground truncate">{typedChat.job?.title} en {typedChat.job?.company}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <ChatUI 
          chatId={id} 
          currentUserId={user.id} 
          initialMessages={initialMessages || []} 
          isEmployer={isEmployer}
        />
      </div>
    </div>
  )
}
