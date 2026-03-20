import { NotificationList } from '@/components/notifications/notification-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })



  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground mt-4 font-medium text-xl">Mantente al tanto de tus matches y aplicaciones en tiempo real.</p>
        </div>
      </div>

      <div className="space-y-6">
        <NotificationList initialNotifications={notifications || []} />
      </div>
    </div>
  )
}
