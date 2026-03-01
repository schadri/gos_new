'use client'
import * as React from 'react'
import { LocationPicker } from '@/components/shared/location-picker'
import { KeywordInput } from '@/components/shared/keyword-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase, Sparkles, AlertCircle, Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const CATEGORY_ROLES: Record<string, string[]> = {
  cocina: [
    "Chef Ejecutivo", "Chef de Cocina", "Sous Chef", "Chef de Partie",
    "Cocinero", "Sushiman", "Pizzero", "Parrillero", "Pastelero",
    "Panadero", "Ayudante de Cocina", "Bachero", "Steward", "Lavaplatos"
  ],
  salon: [
    "Sommelier", "Bartender", "Barman", "Barista", "Camarero",
    "Mozo", "Capitán de Meseros", "Maitre", "Host/Hostess",
    "Ayudante de Camarero", "Adicionista", "Room Service", "Banquetes"
  ],
  hotel: [
    "Gerente de Hotel", "Recepcionista", "Recepcionista de Hotel",
    "Recepcionista de Restaurant", "Jefe de Recepción", "Conserje", "Botones",
    "Valet Parking", "Ama de Llaves", "Supervisor de Limpieza", "Limpieza de Restaurant"
  ],
  gerencia: [
    "Gerente General", "Gerente de Restaurant", "Gerente de Restaurante",
    "Gerente de Operaciones", "Gerente de Alimentos y Bebidas",
    "Gerente Administrativo", "Subgerente", "Encargado de Almacén",
    "Comprador", "Jefe de Mantenimiento", "Encargado de Mantenimiento", "Coordinador de Eventos"
  ]
}

function PostJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [contractType, setContractType] = React.useState('')
  const [experience, setExperience] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [keywords, setKeywords] = React.useState<string[]>([])
  
  const [profileLocation, setProfileLocation] = React.useState<string | null>(null)
  const [companyName, setCompanyName] = React.useState<string>('Empresa Confidencial')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSavingDraft, setIsSavingDraft] = React.useState(false)

  // Load existing job if in edit mode
  React.useEffect(() => {
    if (editId) {
      const fetchJob = async () => {
        const supabase = createClient()
        const { data, error } = await supabase.from('jobs').select('*').eq('id', editId).single()
        if (data && !error) {
          setTitle(data.title || '')
          setDescription(data.description || '')
          setCategory(data.category || '')
          setContractType(data.contract_type || '')
          setExperience(data.experience_required ? (data.experience_required.includes('años') ? data.experience_required : `${data.experience_required} años`) : '')
          setLocation(data.location || '')
          setKeywords(data.keywords || [])
        }
      }
      fetchJob()
    }
  }, [editId])

  React.useEffect(() => {
    // Fetch profile location and company name
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('location, company_name').eq('id', session.user.id).single()
        if (data) {
          if (data.location) setProfileLocation(data.location)
          if (data.company_name) setCompanyName(data.company_name)
        }
      }
    }
    fetchProfile()
  }, [])

  const handlePostJob = async () => {
    try {
      if (!title || !description || !location) {
        toast.error('Por favor completa los campos obligatorios (Título, Descripción, Ubicación)')
        return
      }

      setIsSubmitting(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        toast.error('No hay una sesión activa, inicie sesión de nuevo.')
        router.push('/login')
        return
      }

      const jobData = {
        created_by: session.user.id,
        title: title || 'Sin Título',
        company: companyName,
        description: description || null,
        category: category || null,
        contract_type: contractType || null,
        experience_required: experience ? experience.replace(' años', '') : null,
        location: location || null,
        keywords: keywords,
        status: 'active'
      }

      let error;
      if (editId) {
        const res = await supabase.from('jobs').update(jobData).eq('id', editId)
        error = res.error
      } else {
        const res = await supabase.from('jobs').insert(jobData)
        error = res.error
      }

      if (error) throw error

      toast.success('¡Oferta publicada exitosamente!')
      router.push('/employer/dashboard')
      
    } catch (error: any) {
      toast.error(error.message || 'Error al publicar la oferta')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        toast.error('Sesión expirada.')
        return
      }

      const jobData = {
        created_by: session.user.id,
        title: title || 'Borrador sin título',
        company: companyName,
        description: description || null,
        category: category || null,
        contract_type: contractType || null,
        experience_required: experience ? experience.replace(' años', '') : null,
        location: location || null,
        keywords: keywords,
        status: 'draft'
      }

      let error;
      if (editId) {
        const res = await supabase.from('jobs').update(jobData).eq('id', editId)
        error = res.error
      } else {
        const res = await supabase.from('jobs').insert(jobData).select('id').single()
        error = res.error
        if (!error && res.data) {
          // Instead of redirecting to dashboard, update URL so they keep editing the new draft natively
          router.replace(`/employer/post-job?id=${res.data.id}`)
        }
      }

      if (error) throw error
      toast.success('Borrador guardado.')
      
    } catch (error: any) {
      toast.error('Error al guardar el borrador.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const suggestKeywords = () => {
    // Mocking AI keyword suggestion
    const newKeywords = Array.from(new Set([...keywords, 'Liderazgo', 'Control de stock', 'Trabajo en equipo', 'Limpieza']))
    setKeywords(newKeywords)
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 text-center md:text-left">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 shadow-sm">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">Publicar oferta de Empleo</h1>
        <p className="text-muted-foreground mt-4 text-xl font-medium max-w-2xl">
          Encuentra el perfil exacto que necesitas. Nuestro sistema inteligente de matching buscará a los candidatos más compatibles al instante.
        </p>
      </div>

      <div className="space-y-10">
        {/* Basic Info */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><div className="h-8 w-2 bg-primary rounded-full"></div> Información Básica</h2>
          <div className="grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid gap-3">
                <Label htmlFor="category" className="text-base font-bold">Sector / Categoría</Label>
                <Select onValueChange={(val) => { setCategory(val); setTitle(''); }} value={category}>
                  <SelectTrigger className="h-14 bg-muted/30 text-lg rounded-2xl focus:ring-primary/50">
                    <SelectValue placeholder="Seleccionar sector..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="cocina">Cocina</SelectItem>
                    <SelectItem value="salon">Salón y Barras</SelectItem>
                    <SelectItem value="hotel">Hotelería y Recepción</SelectItem>
                    <SelectItem value="gerencia">Gerencia y Administración</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="title" className="text-base font-bold">Título del Puesto</Label>
                <Select onValueChange={setTitle} value={title} disabled={!category}>
                  <SelectTrigger className="h-14 bg-muted/30 text-lg rounded-2xl focus:ring-primary/50">
                    <SelectValue placeholder={category ? "Seleccionar puesto..." : "Selecciona un sector primero"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-80">
                    {category && CATEGORY_ROLES[category]?.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid gap-3">
                <Label htmlFor="type" className="text-base font-bold">Tipo de Contrato</Label>
                <Select onValueChange={setContractType} value={contractType}>
                  <SelectTrigger className="h-14 bg-muted/30 text-lg rounded-2xl focus:ring-primary/50">
                    <SelectValue placeholder="Seleccionar contrato..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="full-time">Tiempo Completo</SelectItem>
                    <SelectItem value="part-time">Medio Tiempo</SelectItem>
                    <SelectItem value="freelance">Freelance / Independiente</SelectItem>
                    <SelectItem value="temporary">Eventual / Temporada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="exp" className="text-base font-bold">Experiencia Mínima Requerida</Label>
                <Select onValueChange={setExperience} value={experience}>
                  <SelectTrigger className="h-14 bg-muted/30 text-lg rounded-2xl focus:ring-primary/50">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="0-1 años">Sin experiencia / Trainee</SelectItem>
                    <SelectItem value="1-3 años">1 a 3 años (Junior/Semi-Senior)</SelectItem>
                    <SelectItem value="3-5 años">3 a 5 años (Senior)</SelectItem>
                    <SelectItem value="+5 años">+5 años (Experto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

              <div className="flex flex-col gap-2 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between z-10">
                  <span /> {/* Spacer */}
                  {profileLocation && location !== profileLocation && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setLocation(profileLocation)}
                      className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 h-8 self-end sm:self-auto mb-1"
                    >
                      <MapPin className="h-3 w-3 mr-1" /> Utilizar mi ubicación de perfil
                    </Button>
                  )}
                </div>
                <div className="-mt-8">
                  <LocationPicker value={location} onChange={setLocation} />
                </div>
              </div>
          </div>
        </div>

        {/* Details & Requirements */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><div className="h-8 w-2 bg-primary rounded-full"></div> Detalles y Requisitos</h2>
          <div className="grid gap-8">
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-base font-bold">Descripción del Puesto (Responsabilidades)</Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalla qué esperas del candidato, horarios de trabajo, tareas principales..."
                rows={6}
                className="bg-muted/30 text-lg rounded-2xl resize-none p-4 focus-visible:ring-primary/50"
              />
            </div>

            <div className="grid gap-4 mt-2 p-6 md:p-8 bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-3xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
                <div>
                  <Label className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Palabras Clave para el Algoritmo</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Ayudan a encontrar los candidatos ideales. Escribe y presiona Enter.</p>
                </div>
                <Button variant="outline" size="sm" onClick={suggestKeywords} className="hidden sm:flex text-sm font-bold border-primary/30 hover:bg-primary/10 transition-colors rounded-xl shadow-sm">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" /> Sugerir con IA
                </Button>
              </div>
              
              <KeywordInput 
                keywords={keywords} 
                onChange={setKeywords} 
                placeholder="Escribe una habilidad y presiona Enter..." 
                suggestions={[
                  "Puntual", "Prolijo", "Comprometido", "Iniciativa", "Liderazgo", 
                  "Organizado", "Creativo", "Proactivo", "Trabajo en Equipo", 
                  "Adaptabilidad", "Resolución de Problemas", "Vocación de Servicio", 
                  "Versatilidad", "Eficiente", "Capacidad de Aprendizaje"
                ]}
              />
              <Button variant="outline" size="sm" onClick={suggestKeywords} className="sm:hidden w-full flex text-sm font-bold mt-2">
                <Sparkles className="h-4 w-4 mr-2 text-primary" /> Sugerir con IA
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-end pt-8 mb-20">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="w-full sm:w-auto h-16 rounded-2xl font-bold text-lg hover:bg-muted/50"
          >
            {isSavingDraft ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Guardar Borrador
          </Button>
          <Button 
            size="lg" 
            onClick={handlePostJob}
            disabled={isSubmitting || isSavingDraft}
            className="w-full sm:w-auto h-16 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Publicando...
              </>
            ) : "Publicar e Iniciar Matching"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PostJob() {
  return (
    <React.Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Cargando formulario...</p>
        </div>
      }
    >
      <PostJobForm />
    </React.Suspense>
  )
}
