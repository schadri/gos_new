import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/supabase'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await (supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true }) as any) as { data: Profile[] | null }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1 font-medium">Administra a todos los postulantes y emprendedores registrados.</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary font-bold">
          {users?.length || 0} Usuarios Totales
        </Badge>
      </div>

      <AdminUsersTable initialUsers={users || []} />
    </div>
  )
}
