'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, CreditCard, Sparkles, Loader2, ArrowLeft, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

const PACKAGES = [
  { id: 'pack-5', title: '5 Ofertas', price: 5000, credits: 5, urgentCredits: 2, popular: false },
  { id: 'pack-10', title: '10 Ofertas', price: 9000, credits: 10, urgentCredits: 5, popular: true, overridePrice: 'AR$ 10.000' },
  { id: 'pack-15', title: '15 Ofertas', price: 13000, credits: 15, urgentCredits: 10, popular: false },
  { id: 'pack-20', title: '20 Ofertas', price: 16000, credits: 20, urgentCredits: 15, popular: false },
]

export default function EmployerCreditsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [credits, setCredits] = React.useState<number>(0)
  const [freeUntil, setFreeUntil] = React.useState<Date | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [purchasing, setPurchasing] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Show success/failure toast based on URL params from MP
    const successParam = searchParams.get('success')
    if (successParam === 'true') {
      toast.success('¡Compra exitosa! Tus créditos se acreditarán en breve.')
      router.replace('/employer/credits')
    } else if (successParam === 'false') {
      toast.error('Hubo un error con el pago. Por favor intenta nuevamente.')
      router.replace('/employer/credits')
    } else if (successParam === 'pending') {
      toast.info('Tu pago está pendiente de confirmación.')
      router.replace('/employer/credits')
    }
  }, [searchParams, router])

  React.useEffect(() => {
    const fetchBalance = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('credits, free_until').eq('id', user.id).single()
        if (data) {
          const profile = data as any
          setCredits(profile.credits || 0)
          if (profile.free_until) {
            setFreeUntil(new Date(profile.free_until))
          }
        }
      }
      setIsLoading(false)
    }
    fetchBalance()
  }, [])

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasing(packageId)
      
      const res = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      if (!res.ok) throw new Error('Error al crear preferencia r')
      
      const data = await res.json()
      if (data.init_point) {
        // Redirigir a Mercado Pago
        window.location.href = data.init_point
      } else {
        throw new Error('No se recibió init_point')
      }
    } catch (error) {
      console.error(error)
      toast.error('Ocurrió un error al preparar el pago. Intenta más tarde.')
      setPurchasing(null)
    }
  }

  const isFree = freeUntil && freeUntil > new Date()

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors h-12 w-12">
            <Link href="/employer/dashboard"><ArrowLeft className="h-6 w-6" /></Link>
          </Button>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Créditos de Publicación</h1>
        </div>
        <p className="text-muted-foreground mt-4 text-xl font-medium max-w-2xl">
          Compra paquetes de créditos para publicar ofertas de empleo. 1 Crédito = 1 Oferta publicada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Balance Panel */}
        <div className="lg:col-span-1 bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
          <h2 className="font-bold text-xl mb-6">Tu Saldo Actual</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Créditos Disponibles</span>
                <span className="text-4xl font-black text-primary">{credits}</span>
              </div>
              
              {isFree && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-500">¡Periodo de Prueba Activo!</p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80 font-medium">
                      Publicaciones gratuitas hasta el {freeUntil.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {!isFree && credits === 0 && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl">
                  <p className="font-bold text-destructive">Sin saldo</p>
                  <p className="text-sm text-destructive/80 font-medium mt-1">Necesitas créditos para publicar nuevas ofertas de empleo.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Store */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={`relative overflow-hidden rounded-3xl border-2 transition-all hover:shadow-lg ${pkg.popular ? 'border-primary shadow-md shadow-primary/10' : 'border-border/50 bg-card'}`}>
              {pkg.popular && (
                <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest text-center py-1.5 z-10">
                  Más Popular
                </div>
              )}
              {pkg.popular && <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />}
              
              <CardHeader className={pkg.popular ? "pt-10" : "pt-8"}>
                <CardTitle className="text-3xl font-extrabold">{pkg.credits} Créditos</CardTitle>
                <CardDescription className="text-lg font-semibold mt-2">Equivale a {pkg.credits} ofertas de empleo</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">AR$ {pkg.price.toLocaleString('es-AR')}</span>
                </div>
                
                <ul className="space-y-3 mt-6">
                  <li className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 w-fit">
                    <Zap className="h-4 w-4 fill-current" /> {pkg.urgentCredits} Búsquedas Urgentes
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" /> Sin fecha de vencimiento</li>
                  <li className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" /> Soporte prioritario</li>
                  <li className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" /> Acceso a matching inteligente</li>
                </ul>
              </CardContent>
              
              <CardFooter className="pb-8">
                <Button 
                  onClick={() => handlePurchase(pkg.id)} 
                  disabled={purchasing !== null}
                  className={`w-full h-14 rounded-2xl font-bold text-lg ${pkg.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted/50 hover:bg-muted text-foreground'}`}
                >
                  {purchasing === pkg.id ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Procesando pago...</>
                  ) : (
                    <><CreditCard className="h-5 w-5 mr-2" /> Comprar Paquete</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
