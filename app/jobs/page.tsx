'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Briefcase, Clock, Filter, SlidersHorizontal, ChevronRight, Bookmark, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function JobBoard() {
  const [jobs, setJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState('')
  const [locationQuery, setLocationQuery] = React.useState('')
  
  const [selectedContracts, setSelectedContracts] = React.useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = React.useState<string[]>([])
  const [sortBy, setSortBy] = React.useState('Mejor match')

  // Fetch Jobs
  React.useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (data) setJobs(data)
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const handleContractChange = (type: string) => {
    setSelectedContracts(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleExperienceChange = (exp: string) => {
    setSelectedExperience(prev => 
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLocationQuery('')
    setSelectedContracts([])
    setSelectedExperience([])
  }

  // Filter Jobs
  const filteredJobs = React.useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (job.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (job.keywords || []).some((k: string) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchLocation = (job.location?.toLowerCase() || '').includes(locationQuery.toLowerCase())
      
      const matchContract = selectedContracts.length === 0 || 
                            (job.contract_type && selectedContracts.includes(job.contract_type))
      
      const matchExp = selectedExperience.length === 0 || 
                       (job.experience_required && selectedExperience.includes(job.experience_required))

      return matchSearch && matchLocation && matchContract && matchExp
    }).sort((a, b) => {
      if (sortBy === 'Más recientes') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0 // Keep native sort for "Mejor match" or others for now
    })
  }, [jobs, searchQuery, locationQuery, selectedContracts, selectedExperience, sortBy])

  // Map internal database values to display labels
  const getContractLabel = (type: string | null) => {
    if (!type) return 'A convenir'
    const map: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'freelance': 'Freelance',
      'temporary': 'Eventual / Temporada'
    }
    return map[type] || type
  }

  const getExperienceLabel = (exp: string | null) => {
    if (!exp) return 'A convenir'
    return exp.includes('años') ? exp : `${exp} años`
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="mb-12 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Bolsa de Empleo</h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Encuentra {jobs.length > 0 ? `más de ${jobs.length}` : 'nuevas'} oportunidades activas en este momento.</p>
        </div>
        
        <div className="bg-card border border-border/60 p-4 rounded-3xl flex flex-col md:flex-row gap-3 shadow-lg shadow-background/5">
          <div className="flex-1 flex items-center relative w-full bg-muted/30 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-colors">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Puesto, habilidades o empresa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 shadow-none rounded-2xl bg-transparent font-medium text-base"
            />
          </div>
          <div className="flex-1 flex items-center relative w-full bg-muted/30 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-colors">
            <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Ciudad, provincia..." 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="pl-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 shadow-none rounded-2xl bg-transparent font-medium text-base"
            />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl flex items-center gap-2 bg-background border-border shadow-sm font-semibold lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
          <Button className="h-14 px-10 rounded-2xl font-bold text-md shadow-md shadow-primary/20">
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm pt-2">
          <span className="text-muted-foreground font-semibold mr-1">Sugerencias:</span>
          {["Cocinero", "Camarero", "Barista", "Recepcionista", "Gerente"].map((tag, i) => (
            <Badge 
              key={i} 
              variant="secondary" 
              onClick={() => setSearchQuery(tag)}
              className="hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors bg-muted/60 text-foreground font-medium border-transparent px-4 py-1.5 rounded-full"
            >
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
            <span className="text-sm font-medium text-muted-foreground">Mostrando <span className="text-foreground font-extrabold">{filteredJobs.length}</span> resultados relevantes</span>
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordenar por:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border-0 bg-transparent text-sm font-bold text-primary cursor-pointer focus:ring-0 outline-none">
                <option>Mejor match</option>
                <option>Más recientes</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Buscando oportunidades...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-card border border-dashed border-border/60 rounded-3xl p-12 text-center">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold mb-2">No encontramos resultados</h3>
                <p className="text-muted-foreground">Intenta ajustar tus filtros o probar con otras palabras clave.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-6 rounded-xl font-bold">
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                  <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative bg-card ${
                    job.is_featured ? 'border-primary/30 bg-primary/[0.02] shadow-primary/5 hover:border-primary/50' : 'border-border/50 hover:border-border'
                  }`}>
                    
                    {job.is_featured && (
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
                        {job.company?.charAt(0) || <Briefcase className="h-8 w-8 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{job.title}</h2>
                        <div className="flex flex-wrap items-center text-muted-foreground mt-2 text-sm font-medium gap-y-2">
                          <span className="text-foreground font-semibold flex items-center gap-1.5">
                            {job.company || 'Empresa Confidencial'}
                          </span>
                          <span className="mx-3 text-border hidden sm:inline">•</span>
                          <span className="flex items-center bg-muted/50 px-2 py-0.5 rounded-md"><MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" /> {job.location || 'Ubicación no especificada'}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-5 text-sm">
                          <span className="flex items-center bg-background border px-3 py-1.5 rounded-lg font-medium text-foreground">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> 
                            {getContractLabel(job.contract_type)}
                          </span>
                          <span className="flex items-center bg-background border px-3 py-1.5 rounded-lg font-medium text-foreground">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" /> 
                            {getExperienceLabel(job.experience_required)}
                          </span>
                          {job.salary_range && (
                            <span className="font-bold text-foreground bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20">
                              {job.salary_range}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {job.keywords && job.keywords.slice(0, 5).map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="font-medium text-xs bg-background border-border text-muted-foreground px-3 py-1 rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {!loading && filteredJobs.length > 0 && (
            <div className="pt-10 flex justify-center">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl border-border bg-card shadow-sm font-bold h-14 px-8 text-foreground hover:bg-muted">
                Cargar más resultados
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
