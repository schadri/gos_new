'use client'

import * as React from 'react'
import { 
  Search, 
  ShieldCheck, 
  User, 
  MoreVertical, 
  Mail, 
  MapPin, 
  Calendar,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { getAvatarUrl } from '@/lib/utils'
import { Database } from '@/types/supabase'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AdminUsersTableProps {
  initialUsers: Profile[]
}

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [users, setUsers] = React.useState<Profile[]>(initialUsers)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<'ALL' | 'TALENT' | 'BUSINESS'>('ALL')
  const [selectedUser, setSelectedUser] = React.useState<Profile | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filterType === 'ALL' || user.user_type === filterType
      
      return matchesSearch && matchesFilter
    })
  }, [users, searchQuery, filterType])

  const handleManage = (user: Profile) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const toggleAdmin = async () => {
    if (!selectedUser) return
    
    const supabase = createClient()
    const newAdminStatus = !selectedUser.is_admin
    
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ is_admin: newAdminStatus })
        .eq('id', selectedUser.id)
      
      if (error) throw error
      
      setUsers(prev => prev.map(u =>  u.id === selectedUser.id ? { ...u, is_admin: newAdminStatus } : u))
      setSelectedUser(prev => prev ? { ...prev, is_admin: newAdminStatus } : null)
      toast.success(newAdminStatus ? 'Privilegios de admin otorgados' : 'Privilegios de admin removidos')
    } catch (err) {
      console.error('Error updating admin status:', err)
      toast.error('Error al actualizar estado de administrador')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Nombre, empresa o ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-background border-border/50 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={filterType === 'ALL' ? 'secondary' : 'outline'} 
              className="rounded-lg cursor-pointer px-4 py-1"
              onClick={() => setFilterType('ALL')}
            >
              Todos
            </Badge>
            <Badge 
              variant={filterType === 'TALENT' ? 'secondary' : 'outline'} 
              className="rounded-lg cursor-pointer px-4 py-1"
              onClick={() => setFilterType('TALENT')}
            >
              Talentos
            </Badge>
            <Badge 
              variant={filterType === 'BUSINESS' ? 'secondary' : 'outline'} 
              className="rounded-lg cursor-pointer px-4 py-1"
              onClick={() => setFilterType('BUSINESS')}
            >
              Empresas
            </Badge>
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground font-medium">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((profile) => (
                    <tr key={profile.id} className="hover:bg-muted/10 transition-colors group">
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
                            <p className="text-[10px] text-muted-foreground mt-1">ID: {profile.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={profile.user_type === 'BUSINESS' ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20' : 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-500/20'}>
                          {profile.user_type === 'BUSINESS' ? 'Emprendedor' : 'Postulante'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {profile.location || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                          onClick={() => handleManage(profile)}
                        >
                          Gestionar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <SheetHeader className="pb-6 border-b">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 p-0.5">
                    <AvatarImage src={getAvatarUrl(selectedUser.user_type === 'BUSINESS' ? selectedUser.company_logo : selectedUser.profile_photo) || ''} />
                    <AvatarFallback className="text-2xl font-black bg-primary/5 text-primary">
                      {selectedUser.full_name?.charAt(0) || <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl font-black tracking-tight">
                      {selectedUser.full_name || selectedUser.company_name || 'Sin nombre'}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2 font-bold mt-1">
                      <Badge className={selectedUser.user_type === 'BUSINESS' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-orange-500/10 text-orange-700 border-orange-500/20'}>
                        {selectedUser.user_type === 'BUSINESS' ? 'Emprendedor' : 'Postulante'}
                      </Badge>
                      {selectedUser.is_admin && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">ADMIN</Badge>
                      )}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 py-8 space-y-8 overflow-y-auto pr-2">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Información de Contacto</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Ubicación</p>
                        <p className="text-sm font-semibold">{selectedUser.location || 'No especificada'}</p>
                      </div>
                    </div>
                    {selectedUser.updated_at && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Última Actividad</p>
                          <p className="text-sm font-semibold">{new Date(selectedUser.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Acciones Administrativas</h4>
                  <div className="grid gap-3">
                    <Button 
                      variant="outline" 
                      onClick={toggleAdmin}
                      className="w-full justify-start gap-3 rounded-2xl h-12 font-bold"
                    >
                      {selectedUser.is_admin ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {selectedUser.is_admin ? 'Remover privilegios Admin' : 'Hacer Administrador'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 rounded-2xl h-12 font-bold text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Banear Usuario
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 rounded-2xl h-12 font-bold opacity-50 cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar permanentemente
                    </Button>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Nota del Sistema</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Las acciones administrativas se registran en el log de auditoría. Asegúrate de validar la identidad del usuario antes de otorgar privilegios de administrador.
                  </p>
                </div>
              </div>

              <SheetFooter className="mt-auto pt-6 border-t">
                <SheetClose asChild>
                  <Button variant="secondary" className="w-full h-12 rounded-2xl font-bold">Cerrar</Button>
                </SheetClose>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
