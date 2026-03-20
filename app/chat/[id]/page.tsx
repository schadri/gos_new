import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getAvatarUrl } from '@/lib/utils'
import { ChatView } from '@/components/chat/chat-view'

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

  const displayAvatar = getAvatarUrl(
    isEmployer
      ? profile?.profile_photo
      : (profile?.company_logo || profile?.profile_photo)
  )

  // Fetch Initial messages
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true })

  const isPaused = !!chat.is_paused

  return (
    <ChatView 
      chatId={id}
      user={user}
      chat={chat}
      isEmployer={isEmployer}
      displayName={displayName}
      displayAvatar={displayAvatar}
      initialMessages={initialMessages || []}
      isPaused={isPaused}
    />
  )
}
