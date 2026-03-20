import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Users, Star, ArrowRight, Zap, Target, Search, Clock, MapPin, Globe, Shield, Sparkles, ChefHat, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RoleRedirector } from '@/components/shared/role-redirector'
import { RedirectLoading } from '@/components/shared/redirect-loading'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('user_type')
      .eq('id', session.user.id)
      .maybeSingle() as any
    
    console.log(`Home Page: User ${session.user.email} session active. User type: ${profile?.user_type || 'NOT FOUND'}`)

    if (profile?.user_type === 'BUSINESS') {
      console.log('Home Page: Redirecting to employer dashboard')
      redirect('/employer/dashboard')
    } else if (profile?.user_type === 'TALENT') {
      console.log('Home Page: Redirecting to jobs page')
      redirect('/jobs')
    }

    // If session exists but profile is still being created/processed,
    // show only the loading state and let RoleRedirector handle it client-side
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <RedirectLoading />
        <RoleRedirector />
      </div>
    )
  } else {
    console.log('Home Page: No active session.')
  }
  return (
    <div className="flex flex-col min-h-screen">
      <RoleRedirector />
      {/* Hero Section */}
      <section className="w-full flex-1 bg-muted/20 relative overflow-hidden flex items-center py-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse duration-[10000ms]" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] animate-pulse duration-[8000ms]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
          <div className="flex flex-col items-center space-y-10 text-center max-w-5xl mx-auto">
                        
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-foreground">
              Bienvenidos a{' '}
              <span className="text-primary inline-block mt-2">GOS</span>
            </h1>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              La bolsa de trabajo #1 
            </div>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-medium">
               La Comunidad Hotelero Gastronomica de Argentina
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-6 w-full max-w-2xl mt-12 md:mt-8">
              <div className="talent-theme flex flex-col">
                <Link href="/login?flow=talent" className="group relative flex flex-col items-center p-6 sm:p-8 bg-background/80 backdrop-blur-md rounded-3xl shadow-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-1">
                  <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Soy Postulante</h3>
                  <p className="text-muted-foreground font-medium text-center text-sm sm:text-base">Busco trabajo en gastronomía u hotelería</p>
                </Link>
              </div>
              <Link href="/login?flow=employer" className="group relative flex flex-col items-center p-6 sm:p-8 bg-background/80 backdrop-blur-md rounded-3xl shadow-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Soy Emprendedor</h3>
                <p className="text-muted-foreground font-medium text-center text-sm sm:text-base">Busco talento para mi negocio o emprendimiento</p>
              </Link>
            </div>

            
          </div>
        </div>
      </section>

     
    </div>
  )
}
