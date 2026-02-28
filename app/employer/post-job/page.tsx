'use client'
import * as React from 'react'
import { LocationPicker } from '@/components/shared/location-picker'
import { KeywordInput } from '@/components/shared/keyword-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PostJob() {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [salary, setSalary] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [contractType, setContractType] = React.useState('')
  const [experience, setExperience] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [keywords, setKeywords] = React.useState<string[]>([])
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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

      const { error } = await supabase.from('jobs').insert({
        created_by: session.user.id,
        title: title,
        description: description,
        category: category,
        contract_type: contractType,
        experience_required: experience,
        salary_range: salary,
        location: location,
        keywords: keywords,
        status: 'active'
      })

      if (error) throw error

      toast.success('¡Oferta publicada exitosamente!')
      router.push('/employer/dashboard')
      
    } catch (error: any) {
      toast.error(error.message || 'Error al publicar la oferta')
    } finally {
      setIsSubmitting(false)
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
            <div className="grid gap-3">
              <Label htmlFor="title" className="text-base font-bold">Título del Puesto</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Jefe de Cocina, Recepcionista, Bartender..." className="h-14 bg-muted/30 text-lg rounded-2xl focus-visible:ring-primary/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid gap-3">
                <Label htmlFor="category" className="text-base font-bold">Sector / Categoría</Label>
                <Select onValueChange={setCategory}>
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
                <Label htmlFor="type" className="text-base font-bold">Tipo de Contrato</Label>
                <Select onValueChange={setContractType}>
                  <SelectTrigger className="h-14 bg-muted/30 text-lg rounded-2xl focus:ring-primary/50">
                    <SelectValue placeholder="Seleccionar contrato..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="fulltime">Tiempo Completo</SelectItem>
                    <SelectItem value="parttime">Medio Tiempo</SelectItem>
                    <SelectItem value="weekend">Solo Fines de semana</SelectItem>
                    <SelectItem value="event">Eventual / Temporada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <LocationPicker value={location} onChange={setLocation} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid gap-3">
                <Label htmlFor="exp" className="text-base font-bold">Experiencia Mínima Requerida</Label>
                <Select onValueChange={setExperience}>
                  <SelectTrigger className="h-14 bg-muted/30 text-lg rounded-2xl focus:ring-primary/50">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">Sin experiencia / Trainee</SelectItem>
                    <SelectItem value="1">1 año (Junior)</SelectItem>
                    <SelectItem value="3">2 a 3 años (Semi-Senior)</SelectItem>
                    <SelectItem value="5">+5 años (Senior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="salary" className="text-base font-bold">Rango Salarial (Recomendado)</Label>
                <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Ej: $500k - $700k" className="h-14 bg-muted/30 text-lg rounded-2xl focus-visible:ring-primary/50" />
              </div>
            </div>

            <div className="grid gap-4 mt-6 p-6 md:p-8 bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-3xl">
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
                placeholder="Ej: Cocina peruana, Inventarios, Liderazgo, Inglés..." 
              />
              <Button variant="outline" size="sm" onClick={suggestKeywords} className="sm:hidden w-full flex text-sm font-bold mt-2">
                <Sparkles className="h-4 w-4 mr-2 text-primary" /> Sugerir con IA
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-end pt-8 mb-20">
          <Button variant="ghost" size="lg" className="w-full sm:w-auto h-16 rounded-2xl font-bold text-lg hover:bg-muted/50">Guardar Borrador</Button>
          <Button 
            size="lg" 
            onClick={handlePostJob}
            disabled={isSubmitting}
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
