'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function JobActionsMenu({ jobId }: { jobId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta oferta?')) return
    
    try {
      setIsDeleting(true)
      const supabase = createClient()
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (error) throw error
      
      toast.success('Oferta eliminada')
      router.refresh()
    } catch (error) {
      toast.error('Error al eliminar la oferta')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/employer/post-job?id=${jobId}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-muted" disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" /> : <MoreVertical className="h-5 w-5 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer rounded-lg font-medium">
          <Edit className="h-4 w-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="cursor-pointer rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 font-medium">
          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
