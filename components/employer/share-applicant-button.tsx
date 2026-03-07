'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ShareApplicantButtonProps {
  applicantId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function ShareApplicantButton({ 
  applicantId, 
  variant = 'outline', 
  size = 'icon',
  className,
  showText = false
}: ShareApplicantButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Construct the public URL
    const url = `${window.location.origin}/shared/applicant/${applicantId}`
    const shareData = {
      title: 'Perfil de Candidato en GOS',
      text: 'Echa un vistazo a este perfil de candidato',
      url: url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing', err)
          // Fallback to clipboard if share fails but wasn't aborted
          await copyToClipboard(url)
        }
      }
    } else {
      await copyToClipboard(url)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('¡Enlace copiado al portapapeles!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard', err)
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className={className} 
            onClick={handleShare}
            title="Compartir perfil público"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
            {showText && <span className="ml-2 font-bold">{copied ? 'Copiado' : 'Compartir'}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="font-bold">
          <p>Compartir perfil público (sin CV)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
