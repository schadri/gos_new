import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar, AdminNav } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Menu, ShieldCheck, Home } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin status on server side
  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-muted/20">
      <AdminSidebar />
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex h-16 items-center justify-between border-b bg-card px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="p-6 border-b flex items-center gap-3 bg-primary/5">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="font-extrabold text-lg tracking-tight">Admin Portal</span>
              </div>
              <AdminNav className="mt-4" />
              <div className="p-4 border-t">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" asChild>
                    <Link href="/">
                      <Home className="h-4 w-4" /> Volver a la App
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
             <ShieldCheck className="h-5 w-5 text-primary" />
             <span className="font-bold">Admin</span>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
