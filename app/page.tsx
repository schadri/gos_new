import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Users, Star, ArrowRight, Zap, Target, Search, Clock, MapPin, Globe, Shield, Sparkles, ChefHat, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RoleRedirector } from '@/components/shared/role-redirector'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single()
    
    console.log(`Home Page: User ${session.user.email} session active. User type: ${profile?.user_type || 'NOT FOUND'}`)

    if (profile?.user_type === 'BUSINESS') {
      console.log('Home Page: Redirecting to employer dashboard')
      redirect('/employer/dashboard')
    } else if (profile?.user_type === 'TALENT') {
      console.log('Home Page: Redirecting to jobs page')
      redirect('/jobs')
    }
  } else {
    console.log('Home Page: No active session.')
  }
  return (
    <div className="flex flex-col min-h-screen">
      <RoleRedirector />
      {/* Hero Section */}
      <section className="w-full py-20 md:py-24 lg:py-32 xl:py-48 bg-muted/20 relative overflow-hidden flex items-center min-h-[90vh] md:min-h-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse duration-[10000ms]" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] animate-pulse duration-[8000ms]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
          <div className="flex flex-col items-center space-y-10 text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              La bolsa de trabajo #1 en Gastronomía y Hotelería
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-foreground">
              Encuentra tu próximo desafío <span className="text-primary block mt-2 relative inline-block">en cocinas y hoteles</span>
            </h1>
            
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-medium">
              Conectamos a los mejores profesionales con los emprendimientos más destacados del sector. <br className="hidden md:block"/> Busca trabajos o publica tus ofertas.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-6 w-full max-w-2xl mt-12 md:mt-8">
              <Link href="/login?flow=talent" className="group relative flex flex-col items-center p-6 sm:p-8 bg-background/80 backdrop-blur-md rounded-3xl shadow-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <User className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Soy Postulante</h3>
                <p className="text-muted-foreground font-medium text-center text-sm sm:text-base">Busco trabajo en gastronomía u hotelería</p>
              </Link>
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

      {/* How it Works / Value Prop */}
      <section className="w-full py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:14px_24px] opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl max-w-xl">El Match Perfecto para tu Negocio</h2>
              <p className="text-primary-foreground/90 md:text-xl leading-relaxed max-w-lg font-medium">
                Nuestra tecnología de matching inteligente conecta automáticamente los perfiles de talento con las ofertas de los emprendimientos gastronómicos.
              </p>
              <ul className="space-y-6 pt-4">
                {[
                  "Regístrate y completa tu perfil en minutos",
                  "Nuestro algoritmo busca las mejores coincidencias",
                  "Conecta a través de nuestro chat integrado",
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-lg font-medium">
                    <div className="mr-4 h-10 w-10 shrink-0 rounded-full bg-white text-primary flex items-center justify-center font-bold text-xl shadow-lg">{i+1}</div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="font-bold text-lg h-14 px-8 rounded-xl shadow-lg w-full sm:w-auto" asChild>
                  <Link href="/login?flow=employer">Publicar Oferta</Link>
                </Button>
                <Button size="lg" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-transparent border font-bold text-lg h-14 px-8 rounded-xl backdrop-blur-sm w-full sm:w-auto" asChild>
                  <Link href="/login?flow=talent">Crear Perfil</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-3xl blur-2xl"></div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-2 shadow-2xl backdrop-blur-sm transform -rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105 relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2674&auto=format&fit=crop" 
                  alt="Chef trabajando en cocina profesional" 
                  className="w-full h-auto rounded-2xl object-cover opacity-95"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-border/50 animate-bounce delay-1000 duration-[3000ms] z-20">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <ChefHat className="text-green-600 h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">¡Nuevo Match!</p>
                  <p className="text-xs text-muted-foreground font-medium">Chef Ejecutivo • La Mar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
