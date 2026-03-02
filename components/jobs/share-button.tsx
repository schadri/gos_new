'use client'

import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function ShareButton({ title, text }: { title: string, text?: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title,
      text: text || `Mira este puesto: ${title}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing', err)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        toast.success('Enlace copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Error copying to clipboard', err)
        toast.error('No se pudo copiar el enlace')
      }
    }
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleShare}
      title="Compartir"
      className="rounded-full shadow-sm hover:text-primary hover:border-primary/50 transition-colors border-border/50 bg-background"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
    </Button>
  )
}
