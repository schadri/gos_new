'use client'

import * as React from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { RotateCw, ZoomIn, ZoomOut, RotateCcw, RefreshCw } from 'lucide-react'

interface ImageEditorProps {
  imageSrc: string | null
  open: boolean
  onConfirm: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

export function ImageEditor({ imageSrc, open, onConfirm, onCancel, aspectRatio }: ImageEditorProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Reset state when a new image is loaded
  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
    }
  }, [open, imageSrc])

  const onCropComplete = React.useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels || !imageSrc || isProcessing) return
    setIsProcessing(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      onConfirm(croppedBlob)
    } catch (err) {
      console.error('Error cropping image:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg w-[calc(100%-1rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-center text-base font-bold">Editar imagen</DialogTitle>
        </DialogHeader>

        {/* Cropper area */}
        <div className="relative w-full aspect-square bg-black mx-auto overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              cropShape={aspectRatio === 1 ? 'round' : 'rect'}
              showGrid
              objectFit="contain"
            />
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Zoom */}
          <div className="flex items-center gap-3 max-w-xs mx-auto">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>

          {/* Rotate + Reset */}
          <div className="flex items-center justify-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRotation(r => r - 90)} className="gap-1.5">
              <RotateCcw className="h-4 w-4" /> Izquierda
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setRotation(r => r + 90)} className="gap-1.5">
              <RotateCw className="h-4 w-4" /> Derecha
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 pt-0">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isProcessing} className="flex-1 sm:flex-none">
            {isProcessing ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Aplicar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

async function getCroppedImg(src: string, crop: Area, rotation = 0): Promise<Blob> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const max = Math.max(img.width, img.height)
  const safe = 2 * ((max / 2) * Math.sqrt(2))

  canvas.width = safe
  canvas.height = safe
  ctx.translate(safe / 2, safe / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safe / 2, -safe / 2)
  ctx.drawImage(img, safe / 2 - img.width / 2, safe / 2 - img.height / 2)

  const data = ctx.getImageData(0, 0, safe, safe)
  canvas.width = crop.width
  canvas.height = crop.height
  ctx.putImageData(data,
    Math.round(-safe / 2 + img.width / 2 - crop.x),
    Math.round(-safe / 2 + img.height / 2 - crop.y),
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.92)
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
