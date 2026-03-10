'use client'

import * as React from 'react'
import Link from 'next/link'
import { Database } from '@/types/supabase'
import { getAvatarUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Briefcase, Clock, Filter, SlidersHorizontal, ChevronRight, Loader2, Check, ChevronsUpDown, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { PROVINCES } from '@/lib/constants/locations'
import { POSITIONS } from '@/lib/constants/positions'
import { cn } from '@/lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type JobWithProfile = Database['public']['Tables']['jobs']['Row'] & {
  profiles: {
    id: string;
    company_logo: string | null;
  } | null;
  application_status?: string | null;
}


export default function JobBoard() {
  const [jobs, setJobs] = React.useState<JobWithProfile[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState('')
  const [locationQuery, setLocationQuery] = React.useState('')
  const [cityQuery, setCityQuery] = React.useState('')
  
  const [selectedPositions, setSelectedPositions] = React.useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([])
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null)
  const [sortBy, setSortBy] = React.useState('Mejor match')
 
  // Fetch Jobs
  React.useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        if (!supabase) return

        // 1. Fetch active jobs
        const { data: jobsData, error: jobsError } = await (supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false }) as any)
        
        if (jobsError) throw jobsError
        if (!jobsData) {
          setJobs([])
          return
        }

        // 2. Fetch employer profiles for these jobs
        const employerIds = Array.from(new Set(jobsData.map((j: any) => j.created_by)))
        let profilesData: any[] = []
        if (employerIds.length > 0) {
          const { data } = await (supabase
            .from('profiles')
            .select('id, company_logo')
            .in('id', employerIds) as any)
          profilesData = data || []
        }

        // 3. Fetch current user's applications
        const { data: { user } } = await supabase.auth.getUser()
        let userApplications: any[] = []
        if (user) {
          const { data: appsData } = await supabase
            .from('job_applications')
            .select('job_id, status')
            .eq('applicant_id', user.id)
          userApplications = appsData || []
        }

        // 4. Combine all data
        const jobsWithProfiles = jobsData.map((job: any) => {
          const employerProfile = profilesData?.find((p: any) => p.id === job.created_by) || null
          const userApp = userApplications.find((a: any) => a.job_id === job.id)
          
          return {
            ...job,
            profiles: employerProfile,
            application_status: userApp?.status || null
          }
        }) as JobWithProfile[]
        
        setJobs(jobsWithProfiles)
      } catch (err) {
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handlePositionChange = (pos: string) => {
    setSelectedPositions(prev => 
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    )
  }

  const handleLocationChange = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLocationQuery('')
    setCityQuery('')
    setSelectedPositions([])
    setSelectedLocations([])
    setExpandedCategory(null)
  }

  // Filter Jobs
  const filteredJobs = React.useMemo(() => {
    return jobs.filter(job => {
      // 1. Text Search (Title, Company, Keywords)
      const matchSearch = (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (job.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (job.keywords || []).some((k: string) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // 2. Bar Search (Input Province)
      const matchBarLocation = !locationQuery || (job.location?.toLowerCase() || '').includes(locationQuery.toLowerCase())
      
      // 2.b Bar Search (Input City)
      const matchCity = !cityQuery || (job.location?.toLowerCase() || '').includes(cityQuery.toLowerCase())
      
      // 3. Sidebar Multi-Location
      const matchSidebarLocation = selectedLocations.length === 0 || 
                                   (job.location && selectedLocations.some(loc => job.location?.includes(loc)))

      // 4. Sidebar Position Filter
      const jobTitle = job.title?.toLowerCase() || ''
      const jobKeywords = (job.keywords || []).map((k: string) => k.toLowerCase())
      
      const matchPosition = selectedPositions.length === 0 || 
                            selectedPositions.some(pos => {
                              const lowerPos = pos.toLowerCase()
                              return jobTitle.includes(lowerPos) || jobKeywords.includes(lowerPos)
                            })

      return matchSearch && matchBarLocation && matchCity && matchSidebarLocation && matchPosition
    }).sort((a, b) => {
      if (sortBy === 'Más recientes') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })
  }, [jobs, searchQuery, locationQuery, selectedPositions, selectedLocations, sortBy])

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

  // Ensure company logos use the avatar mapper
  const jobsWithUrlFixed = jobs?.map(job => ({
    ...job,
    profiles: job.profiles ? {
      ...job.profiles,
      company_logo: getAvatarUrl(job.profiles.company_logo)
    } : null
  })) as JobWithProfile[] || []

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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  className="w-full h-14 justify-start pl-4 pr-4 bg-transparent hover:bg-transparent text-foreground font-medium text-base rounded-2xl"
                >
                  <MapPin className="mr-3 h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {locationQuery || "Provincia..."}
                  </span>
                  <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar provincia..." />
                  <CommandList>
                    <CommandEmpty>No se encontró la provincia.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setLocationQuery('')}
                        className="font-bold text-primary"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            locationQuery === '' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas las provincias
                      </CommandItem>
                      {PROVINCES.map((province) => (
                        <CommandItem
                          key={province}
                          value={province}
                          onSelect={(currentValue) => {
                            setLocationQuery(currentValue === locationQuery ? "" : currentValue)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              locationQuery === province ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {province}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1 flex items-center relative w-full bg-muted/30 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-colors">
            <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground/50" />
            <Input 
              placeholder="Ciudad (Opcional)..." 
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
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

        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-10">
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /> Filtros</h3>
              <button 
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                Limpiar
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Position Filter */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground">Puesto</h4>
                <div className="space-y-2">
                  {POSITIONS.map(group => (
                    <div key={group.category} className="space-y-2">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === group.category ? null : group.category)}
                        className={cn(
                          "w-full flex items-center justify-between text-sm font-semibold p-2 rounded-xl transition-colors",
                          expandedCategory === group.category ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {group.category}
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform",
                          expandedCategory === group.category && "rotate-90"
                        )} />
                      </button>
                      
                      {expandedCategory === group.category && (
                        <div className="pl-4 space-y-3 pt-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                          {group.items.map(item => (
                            <div key={item} className="flex items-center gap-3 group">
                              <input 
                                type="checkbox" 
                                id={`pos-${item}`} 
                                checked={selectedPositions.includes(item)}
                                onChange={() => handlePositionChange(item)}
                                className="rounded-md border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 bg-muted/20 cursor-pointer" 
                              />
                              <label htmlFor={`pos-${item}`} className="text-xs cursor-pointer text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-border/60"></div>

              {/* Location Filter */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground">Ubicación</h4>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {PROVINCES.map(province => (
                    <div key={province} className="flex items-center gap-3 group">
                      <input 
                        type="checkbox" 
                        id={`loc-${province}`} 
                        checked={selectedLocations.includes(province)}
                        onChange={() => handleLocationChange(province)}
                        className="rounded-md border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 bg-muted/20 cursor-pointer" 
                      />
                      <label htmlFor={`loc-${province}`} className="text-sm cursor-pointer text-muted-foreground font-medium group-hover:text-foreground transition-colors">{province}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-3 space-y-6">

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

                    {job.application_status === 'auto-match' && (
                      <div className="absolute top-0 left-8 translate-y-[-50%] bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> ¡MATCH IDEAL!
                      </div>
                    )}
                    

                    
                    <div className="flex flex-col sm:flex-row sm:items-start gap-6 pr-10">
                      <Avatar className="h-20 w-20 rounded-2xl border bg-background flex-shrink-0 group-hover:scale-105 group-hover:shadow-md transition-all shadow-sm">
                        <AvatarImage src={getAvatarUrl(job.profiles?.company_logo) || ''} alt={job.company ?? undefined} className="object-cover" />
                        <AvatarFallback className="text-2xl font-extrabold bg-primary/5 text-primary rounded-2xl">
                          {job.company?.charAt(0) || <Briefcase className="h-8 w-8 text-muted-foreground" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{job.title}</h2>
                        <div className="flex flex-wrap items-center text-muted-foreground mt-2 text-sm font-medium gap-y-2">
                          <span className="text-foreground font-bold flex items-center gap-1.5">
                            {job.company || 'Empresa Confidencial'}
                          </span>
                          <span className="mx-3 text-border hidden sm:inline">•</span>
                          <span className="flex items-center bg-muted/50 px-3 py-1 rounded-full"><MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" /> {job.location || 'Ubicación no especificada'}</span>
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
          
          {!loading && filteredJobs.length >= 5 && (
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
