import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/supabase'
import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { LaunchPromoButton, DeactivatePromoButton } from '@/components/admin/launch-promo-button'

type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileWithEmail = Profile & { email?: string }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const adminClient = getSupabaseAdmin()

  // 1. Fetch profiles
  const { data: profiles } = await (supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true }) as any) as { data: Profile[] | null }

  // 2. Fetch all users from Auth to get emails
  // For small to medium apps, listUsers() is fine. 
  // For large apps, we'd need a more scalable sync or specific fetch.
  const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // 3. Map emails to profiles
  const usersWithEmails: ProfileWithEmail[] = (profiles || []).map(profile => {
    const authUser = authUsers?.find(au => au.id === profile.id)
    return {
      ...profile,
      email: authUser?.email
    }
  })

  // Check if at least one BUSINESS user has an active free_until date
  const isPromoActive = (profiles || []).some(p => 
    p.user_type === 'BUSINESS' && p.free_until && new Date(p.free_until) > new Date()
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm md:text-base">Administra a todos los postulantes y emprendedores registrados.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isPromoActive ? <DeactivatePromoButton /> : <LaunchPromoButton />}
          <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary font-bold whitespace-nowrap hidden lg:flex">
            {profiles?.length || 0} Usuarios Totales
          </Badge>
        </div>
      </div>

      <AdminUsersTable initialUsers={usersWithEmails} />
    </div>
  )
}
