import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/utils'
import { Search, Filter, ShieldCheck, User } from 'lucide-react'
import { Database } from '@/types/supabase'

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

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground px-2">
                <Search className="h-4 w-4" /> Buscar...
            </div>
            <div className="flex gap-2">
                <Badge variant="secondary" className="rounded-lg cursor-pointer">Todos</Badge>
                <Badge variant="outline" className="rounded-lg cursor-pointer">Talentos</Badge>
                <Badge variant="outline" className="rounded-lg cursor-pointer">Empresas</Badge>
            </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">Tipo</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">Ubicación</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarImage src={getAvatarUrl(profile.user_type === 'BUSINESS' ? profile.company_logo : profile.profile_photo) || ''} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {profile.full_name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm leading-none flex items-center gap-1.5">
                            {profile.full_name || profile.company_name || 'Sin nombre'}
                            {profile.is_admin && <ShieldCheck className="h-3 w-3 text-primary" />}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">ID: {profile.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={profile.user_type === 'BUSINESS' ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20' : 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-500/20'}>
                        {profile.user_type === 'BUSINESS' ? 'Emprendedor' : 'Postulante'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-muted-foreground">{profile.location || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-primary hover:underline">Gestionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
