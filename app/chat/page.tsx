import Link from 'next/link'
import { Search, Send, MapPin, Briefcase, Bell, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAvatarUrl } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch all chats for the current user
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      *,
      job:jobs(title, company)
    `)
    .or(`employer_id.eq.${user.id},applicant_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  let typedChats: any[] = chats || []

  if (typedChats.length > 0) {
    // Collect all other participant IDs
    const otherParticipantIds = typedChats.map(chat => 
      chat.employer_id === user.id ? chat.applicant_id : chat.employer_id
    )

    // Fetch profiles for these participants
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, profile_photo, company_name, company_logo')
      .in('id', otherParticipantIds)

    // Combine data
    typedChats = typedChats.map(chat => {
      const otherId = chat.employer_id === user.id ? chat.applicant_id : chat.employer_id
      const profile = profiles?.find(p => p.id === otherId)
      const isEmployer = chat.employer_id === user.id
      
      const displayName = isEmployer 
        ? (profile?.full_name || 'Candidato')
        : (profile?.company_name || profile?.full_name || 'Empresa')

      const displayAvatar = getAvatarUrl(
        isEmployer
          ? profile?.profile_photo
          : (profile?.company_logo || profile?.profile_photo)
      )

      return {
        ...chat,
        displayName,
        displayAvatar,
        otherId
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-6rem)]">
      <div className="bg-card border border-border/60 rounded-[2rem] shadow-sm flex h-full overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-border/60 flex flex-col h-full bg-muted/10">
          <div className="p-6 lg:p-8 border-b border-border/60">
            <h2 className="text-3xl font-extrabold mb-6">Mensajes</h2>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Buscar chat..." className="pl-12 bg-background rounded-2xl h-12 border-border/50 font-medium text-base shadow-sm" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
            {typedChats.length === 0 ? (
              <div className="text-center py-10 opacity-50 px-4">
                <Bell className="h-10 w-10 mx-auto mb-4" />
                <p className="font-bold">No hay mensajes aún</p>
                <p className="text-sm">Cuando tengas un match, aparecerá aquí.</p>
              </div>
            ) : (
              typedChats.map((chat) => (
                <Link 
                  href={`/chat/${chat.id}`}
                  key={chat.id} 
                  className="p-4 lg:p-5 rounded-2xl flex gap-4 lg:gap-5 cursor-pointer transition-all duration-300 hover:bg-muted border border-transparent hover:border-border/50 bg-background/50"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden border">
                    {chat.displayAvatar ? (
                      <img src={chat.displayAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      chat.displayName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1.5">
                      <h3 className="font-bold truncate pr-2 text-lg text-foreground/80">{chat.displayName}</h3>
                      <span className="text-xs font-bold shrink-0 text-muted-foreground">
                        {new Date(chat.updated_at || chat.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate text-muted-foreground">
                      {chat.job?.title || 'Nuevo Match'}
                    </p>
                  </div>
                </Link>
              ))
             )}
          </div>
        </div>

        {/* Placeholder for Desktop */}
        <div className="hidden md:flex flex-col flex-1 h-full bg-background relative items-center justify-center p-12 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <MessageSquare className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold mb-3">Tus Conversaciones</h2>
              <p className="text-muted-foreground font-medium">
                Selecciona un chat de la lista de la izquierda para comenzar a hablar con el talento o la empresa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
