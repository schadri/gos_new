import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Clock, Calendar, CheckCircle2, Building, ArrowLeft, Share2 } from 'lucide-react'

export default function JobDetail({ params }: { params: { id: string } }) {
  // Mock data for the specific job
  const job = { 
    id: params.id, 
    title: 'Jefe de Cocina', 
    company: 'La Mar Cevichería', 
    location: 'Buenos Aires, Palermo', 
    type: 'Tiempo Completo', 
    exp: '3-5 años', 
    salary: '$800k - $1M', 
    publishedAt: 'Hace 2 días',
    description: `Buscamos un Jefe de Cocina apasionado por la gastronomía peruana y del mar para liderar nuestro equipo en Palermo. 
    
El candidato ideal debe tener un fuerte perfil de liderazgo, sólidos conocimientos en costos, mermas y estandarización de recetas. Es indispensable la proactividad y la capacidad para trabajar bajo presión en despachos de alto volumen.

**Responsabilidades:**
- Liderar y capacitar al equipo de cocina.
- Asegurar la calidad y presentación de los platos según nuestros estándares.
- Controlar inventarios, compras y mermas.
- Mantener estrictas normas de higiene y seguridad alimentaria.
- Optimizar los tiempos de despacho.`,
    requirements: [
      'Al menos 3 años de experiencia comprobable como Jefe o Subjefe de Cocina.',
      'Experiencia preferente en volumen y pescados/cocina peruana.',
      'Manejo de equipos de más de 10 personas.',
      'Disponibilidad full time, incluyendo fines de semana y feriados.'
    ],
    tags: ['Pescados', 'Liderazgo', 'Costos', 'Ceviches', 'Inventario']
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/jobs" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a los resultados
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-8 sm:p-10 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex items-start justify-between gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-background border flex items-center justify-center flex-shrink-0 text-foreground font-extrabold text-3xl sm:text-4xl shadow-sm">
                {job.company.charAt(0)}
              </div>
              <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:text-primary hover:border-primary/50 transition-colors border-border/50 bg-background">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">{job.title}</h1>
              <div className="flex items-center text-muted-foreground text-lg font-medium bg-muted/30 w-fit px-4 py-1.5 rounded-full border border-border/40">
                <Building className="h-5 w-5 mr-2" />
                <span className="text-foreground font-semibold">{job.company}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-10">
              <Badge variant="secondary" className="px-5 py-2.5 font-bold text-sm rounded-xl bg-background border border-border/50 shadow-sm text-foreground"><MapPin className="h-4 w-4 mr-2 text-primary" /> {job.location}</Badge>
              <Badge variant="secondary" className="px-5 py-2.5 font-bold text-sm rounded-xl bg-background border border-border/50 shadow-sm text-foreground"><Briefcase className="h-4 w-4 mr-2 text-primary" /> {job.type}</Badge>
              <Badge variant="secondary" className="px-5 py-2.5 font-bold text-sm rounded-xl bg-background border border-border/50 shadow-sm text-foreground"><Clock className="h-4 w-4 mr-2 text-primary" /> {job.exp}</Badge>
            </div>
          </div>

          <div className="space-y-10 p-8 sm:p-10 bg-card rounded-3xl border border-border/50 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center"><CheckCircle2 className="mr-3 h-6 w-6 text-primary" /> Descripción del Puesto</h2>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium text-lg">
                {job.description}
              </div>
            </div>

            <div className="h-px bg-border/60"></div>

            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center"><CheckCircle2 className="mr-3 h-6 w-6 text-primary" /> Requisitos</h2>
              <ul className="space-y-4">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-4 mt-2 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 shadow-sm"></span>
                    <span className="text-muted-foreground font-medium text-lg">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-border/60"></div>

            <div>
              <h2 className="text-xl font-bold mb-5">Habilidades Clave (Keywords)</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="px-4 py-2 text-sm font-semibold bg-primary/5 hover:bg-primary/10 border-primary/20 text-foreground rounded-xl transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl shadow-sm space-y-8 sticky top-28">
            <div className="p-4 bg-background rounded-2xl border border-primary/10 text-center shadow-sm">
              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Salario Ofrecido</p>
              <p className="text-3xl font-extrabold text-green-700 dark:text-green-500">{job.salary}</p>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center text-sm font-medium bg-background/60 p-3 rounded-xl">
                <Calendar className="mr-3 h-5 w-5 text-primary" />
                <span className="text-foreground">Publicado: {job.publishedAt}</span>
              </div>
              <div className="flex items-center text-sm font-medium bg-background/60 p-3 rounded-xl">
                <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                <span className="text-foreground"><span className="font-bold">12</span> postulantes interesados</span>
              </div>
              
              {/* Fake Match indicator */}
              <div className="flex items-center justify-between bg-primary whitespace-nowrap text-primary-foreground p-3 rounded-xl mt-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 w-1/2 transform skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                <span className="font-bold text-sm relative z-10 w-full text-center">¡Eres un Match del 85%!</span>
              </div>
            </div>

            <div className="pt-2">
              <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform">
                Postularme Ahora
              </Button>
              <p className="text-xs text-center text-muted-foreground font-medium mt-4">
                Al postularte, el empleador podrá ver tu perfil y CV completo automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
