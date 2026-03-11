import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Shield, Bell, Database, Save } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Ajustes del Sistema</h1>
        <p className="text-muted-foreground mt-1 font-medium">Configuración técnica y parámetros globales de la plataforma.</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Seguridad y Roles
            </CardTitle>
            <CardDescription>Configura permisos predeterminados y niveles de acceso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-dashed">
               <div>
                 <p className="text-sm font-bold text-foreground">Registro de Nuevos Administradores</p>
                 <p className="text-xs text-muted-foreground">Actualmente deshabilitado por seguridad.</p>
               </div>
               <Button variant="outline" size="sm" disabled className="rounded-xl">Configurar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notificaciones Globales
            </CardTitle>
            <CardDescription>Envía anuncios a todos los usuarios de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-dashed">
               <div>
                 <p className="text-sm font-bold text-foreground">Newsletter Semanal</p>
                 <p className="text-xs text-muted-foreground">Configuración de envíos programados.</p>
               </div>
               <Button variant="outline" size="sm" className="rounded-xl">Gestionar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> Mantenimiento
            </CardTitle>
            <CardDescription>Acciones de limpieza y optimización de datos.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-dashed">
               <div>
                 <p className="text-sm font-bold text-foreground">Limpieza de Ofertas Expiradas</p>
                 <p className="text-xs text-muted-foreground">Elimina automáticamente ofertas con más de 90 días.</p>
               </div>
               <Button variant="destructive" size="sm" className="rounded-xl">Ejecutar Ahora</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button className="rounded-2xl h-12 px-8 font-bold gap-2 shadow-lg shadow-primary/20">
          <Save className="h-4 w-4" /> Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
