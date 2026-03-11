import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RoleRedirector } from '@/components/shared/role-redirector'
import { RedirectLoading } from '@/components/shared/redirect-loading'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { LogoGOS } from '@/components/logo-gos'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('user_type')
      .eq('id', session.user.id)
      .maybeSingle() as any
    
    if (profile?.user_type === 'BUSINESS') {
      redirect('/employer/dashboard')
    } else if (profile?.user_type === 'TALENT') {
      redirect('/jobs')
    }

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <RedirectLoading />
        <RoleRedirector />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-mesh overflow-x-hidden">
      <RoleRedirector />
      
      {/* Decorative Orbs - Using brand colors for "Intensity" */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      
      {/* Hero Content */}
      <section className="w-full flex-1 flex items-center py-20 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-12 text-center max-w-5xl mx-auto">
            
           

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground drop-shadow-sm leading-[1.1]">
                Bienvenidos a <br />
                <span className="text-transparent bg-clip-text animate-brand-flash pr-4">GOS</span>
              </h1>
              
              {/* Badge */}
              <div className="inline-flex items-center rounded-full border border-secondary/40 bg-secondary/20 px-6 py-2 text-sm font-bold text-secondary shadow-lg shadow-secondary/10 animate-in slide-in-from-top-4 duration-700 mx-auto">
                <span className="relative flex h-2.5 w-2.5 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                </span>
                LA BOLSA DE TRABAJO #1 
              </div>

              <p className="mx-auto max-w-[800px] text-muted-foreground text-xl md:text-2xl font-semibold leading-relaxed">
                La Comunidad Hotelero Gastronomica <br className="hidden md:block"/> mas grande de Argentina
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl pt-8">
              {/* TALENT CARD */}
              <Link 
                href="/login?flow=talent" 
                className="group relative flex flex-col items-center p-8 md:p-12 bg-background/40 backdrop-blur-xl rounded-[40px] border-2 border-border/50 hover:border-secondary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(249,115,22,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="p-5 rounded-3xl bg-secondary/20 text-secondary mb-6 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all shadow-xl shadow-secondary/20 glow-secondary">
                    <LogoGOS className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-3 text-foreground tracking-tight">Soy Postulante</h3>
                  <p className="text-muted-foreground font-semibold mb-8">Busco mi próximo desafío en gastronomía u hotelería</p>
                  
                  <div className="flex items-center gap-2 text-secondary font-extrabold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                    Ingresar <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>

              {/* EMPLOYER CARD */}
              <Link 
                href="/login?flow=employer" 
                className="group relative flex flex-col items-center p-8 md:p-12 bg-background/40 backdrop-blur-xl rounded-[40px] border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(13,148,136,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="p-5 rounded-3xl bg-primary/20 text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/20 glow-primary">
                    <LogoGOS className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-3 text-foreground tracking-tight">Soy Emprendedor</h3>
                  <p className="text-muted-foreground font-semibold mb-8">Busco el mejor talento para elevar mi equipo</p>
                  
                  <div className="flex items-center gap-2 text-primary font-extrabold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                    Ingresar <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Social Proof / Stats sutiles */}
            {/* <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-12 opacity-80">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-foreground">5.000+</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Postulantes</span>
              </div>
              <div className="w-px h-10 bg-border hidden md:block" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-foreground">400+</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Empresas</span>
              </div>
              <div className="w-px h-10 bg-border hidden md:block" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-foreground">100%</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gratis para el talento</span>
              </div>
            </div> */}
            
          </div>
        </div>
      </section>
      
      
    </div>
  )
}
