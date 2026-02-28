import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Briefcase, Clock, Filter, SlidersHorizontal, ChevronRight, Bookmark } from 'lucide-react'

// Mock Data for jobs
const MOCK_JOBS = [
  { id: 1, title: 'Jefe de Cocina', company: 'La Mar Cevichería', location: 'Buenos Aires, Palermo', type: 'Tiempo Completo', exp: '3-5 años', salary: '$800k - $1M', featured: true, tags: ['Pescados', 'Liderazgo', 'Costos'] },
  { id: 2, title: 'Bartender Principal', company: 'Florería Atlántico', location: 'Buenos Aires, Retiro', type: 'Tiempo Completo', exp: '2-3 años', salary: 'A convenir', featured: true, tags: ['Coctelería clásica', 'Inglés intermedio'] },
  { id: 3, title: 'Recepcionista Bilingüe', company: 'Four Seasons Hotel', location: 'Buenos Aires, Recoleta', type: 'Medio Tiempo', exp: '1 año', salary: '$500k', featured: false, tags: ['Inglés avanzado', 'Atención al cliente'] },
  { id: 4, title: 'Camarero /a', company: 'Don Julio', location: 'Buenos Aires, Palermo', type: 'Fines de semana', exp: 'Sin experiencia', salary: '$400k (Base + Propinas)', featured: false, tags: ['Vinos', 'Carnes', 'Proactividad'] },
  { id: 5, title: 'Pastelero', company: 'Ninina Bakery', location: 'Buenos Aires, Belgrano', type: 'Tiempo Completo', exp: '2 años', salary: '$600k', featured: false, tags: ['Masas madres', 'Decoración'] },
]

export default function JobBoard() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Header & Search */}
      <div className="mb-12 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Bolsa de Empleo</h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Descubre mas de 120+ oportunidades activas en este momento.</p>
        </div>
        
        <div className="bg-card border border-border/60 p-4 rounded-3xl flex flex-col md:flex-row gap-3 shadow-lg shadow-background/5">
          <div className="flex-1 flex items-center relative w-full bg-muted/30 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-colors">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Puesto, habilidades o empresa..." 
              className="pl-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 shadow-none rounded-2xl bg-transparent font-medium text-base"
            />
          </div>
          <div className="flex-1 flex items-center relative w-full bg-muted/30 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-colors">
            <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Ciudad, provincia..." 
              className="pl-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 shadow-none rounded-2xl bg-transparent font-medium text-base"
            />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl flex items-center gap-2 bg-background border-border shadow-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
          <Button className="h-14 px-10 rounded-2xl font-bold text-md shadow-md shadow-primary/20">
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm pt-2">
          <span className="text-muted-foreground font-semibold mr-1">Búsquedas populares:</span>
          {["Cocinero", "Camarero", "Barista", "Hostess", "Gerente"].map((tag, i) => (
            <Badge key={i} variant="secondary" className="hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors bg-muted/60 text-foreground font-medium border-transparent px-4 py-1.5 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-10">
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /> Filtros</h3>
              <button className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors">Limpiar</button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground">Tipo de Contrato</h4>
                {['Tiempo Completo', 'Medio Tiempo', 'Fines de semana', 'Eventual'].map(type => (
                  <div key={type} className="flex items-center gap-3 group">
                    <input type="checkbox" id={type} className="rounded-md border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 bg-muted/20 cursor-pointer" />
                    <label htmlFor={type} className="text-sm cursor-pointer text-muted-foreground font-medium group-hover:text-foreground transition-colors">{type}</label>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-border/60"></div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground">Experiencia Requerida</h4>
                {['Sin experiencia', '1 año', '2-3 años', '+5 años'].map(type => (
                  <div key={type} className="flex items-center gap-3 group">
                    <input type="checkbox" id={`exp-${type}`} className="rounded-md border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 bg-muted/20 cursor-pointer" />
                    <label htmlFor={`exp-${type}`} className="text-sm cursor-pointer text-muted-foreground font-medium group-hover:text-foreground transition-colors">{type}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <span className="text-sm font-medium text-muted-foreground">Mostrando <span className="text-foreground font-extrabold">{MOCK_JOBS.length}</span> resultados relevantes</span>
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordenar por:</span>
              <select className="border-0 bg-transparent text-sm font-bold text-primary cursor-pointer focus:ring-0 outline-none">
                <option>Mejor match</option>
                <option>Más recientes</option>
                <option>Mayor salario</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            {MOCK_JOBS.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative bg-card ${
                  job.featured ? 'border-primary/30 bg-primary/[0.02] shadow-primary/5 hover:border-primary/50' : 'border-border/50 hover:border-border'
                }`}>
                  
                  {job.featured && (
                    <div className="absolute top-0 right-8 translate-y-[-50%] bg-gradient-to-r from-primary to-orange-500 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      DESTACADO
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between absolute right-6 top-6">
                    <button className="text-muted-foreground/50 hover:text-primary transition-colors hover:scale-110">
                      <Bookmark className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6 pr-10">
                    <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center flex-shrink-0 text-foreground font-extrabold text-2xl group-hover:scale-105 group-hover:shadow-md transition-all shadow-sm">
                      {job.company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{job.title}</h2>
                      <div className="flex flex-wrap items-center text-muted-foreground mt-2 text-sm font-medium gap-y-2">
                        <span className="text-foreground font-semibold flex items-center gap-1.5">
                          {job.company}
                        </span>
                        <span className="mx-3 text-border hidden sm:inline">•</span>
                        <span className="flex items-center bg-muted/50 px-2 py-0.5 rounded-md"><MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" /> {job.location}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-5 text-sm">
                        <span className="flex items-center bg-background border px-3 py-1.5 rounded-lg font-medium text-foreground"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> {job.type}</span>
                        <span className="flex items-center bg-background border px-3 py-1.5 rounded-lg font-medium text-foreground"><Clock className="h-4 w-4 mr-2 text-muted-foreground" /> {job.exp}</span>
                        <span className="font-bold text-foreground bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20">{job.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="font-medium text-xs bg-background border-border text-muted-foreground px-3 py-1 rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Hace 2 días</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="pt-10 flex justify-center">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl border-border bg-card shadow-sm font-bold h-14 px-8 text-foreground hover:bg-muted">
              Cargar más resultados
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
