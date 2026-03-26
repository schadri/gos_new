'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, Loader2 } from 'lucide-react'
import { activateLaunchPromotionAction } from '@/app/actions/admin-users'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function LaunchPromoButton() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleActivate = async () => {
    setLoading(true)
    try {
      const result = await activateLaunchPromotionAction()
      if (result.success) {
        setOpen(false)
      } else {
        alert(result.error)
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-md shadow-orange-500/20 px-4 py-2 h-auto flex gap-2 items-center rounded-xl transition-all hover:scale-105">
          <Rocket className="h-5 w-5" />
          <span className="hidden sm:inline">Lanzamiento 30 Días</span>
          <span className="sm:hidden">Promo 30D</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Rocket className="h-6 w-6 text-orange-500" />
            Mega Promo Lanzamiento
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2 text-foreground/80">
            Esta acción otorgará <strong className="text-foreground text-orange-600">30 días de prueba gratuita VIP</strong> a absolutamente <b>todas</b> las Empresas (BUSINESS) registradas actualmente en la plataforma.
            <br/><br/>
            Durante este período, podrán publicar ofertas ilimitadas sin consumir sus créditos.
            <br/><br/>
            ¿Estás seguro de que deseas regalar este beneficio a todas las empresas?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={() => setOpen(false)}>Cancelar</AlertDialogCancel>
          <Button onClick={handleActivate} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            ¡Activar a todos Ahora!
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
