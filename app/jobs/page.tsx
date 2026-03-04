'use client'

import * as React from 'react'
import Link from 'next/link'
import { Database } from '@/types/supabase'
import { getAvatarUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Briefcase, Clock, Filter, SlidersHorizontal, ChevronRight, Bookmark, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type JobWithProfile = Database['public']['Tables']['jobs']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null
}

export default function JobBoard() {
  const [jobs, setJobs] = React.useState<JobWithProfile[]>([])
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
      try {
        const supabase = createClient()
        // 1. Fetch active jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        
        if (jobsError) throw jobsError
        if (!jobsData) {
          setJobs([])
          return
        }

        // 2. Fetch employer profiles for these jobs
        const employerIds = Array.from(new Set(jobsData.map(j => j.created_by)))
        if (employerIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, company_logo')
            .in('id', employerIds)
          
          if (!profilesError && profilesData) {
            const jobsWithProfiles = jobsData.map(job => ({
              ...job,
              profiles: profilesData.find(p => p.id === job.created_by) || null
            })) as JobWithProfile[]
            setJobs(jobsWithProfiles)
          } else {
            setJobs(jobsData as JobWithProfile[])
          }
        } else {
          setJobs(jobsData as JobWithProfile[])
        }
      } catch (err) {
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
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

  // Ensure company logos use the avatar mapper
  const jobsWithUrlFixed = jobs?.map(job => ({
    ...job,
    profiles: job.profiles ? {
      ...job.profiles,
      company_logo: getAvatarUrl(job.profiles.company_logo)
    } : null
  })) as JobWithProfile[] || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-3xl border border-primary/20 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-balance">
          Encuentra tu próximo desafío
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl text-balance">
          Explora cientos de oportunidades en gastronomía y hotelería. Filtra por especialidad, experiencia y ubicación para encontrar el trabajo ideal para ti.
        </p>
      </div>
      
      <JobSearchList initialJobs={jobsWithUrlFixed} />
    </div>
  )
}
