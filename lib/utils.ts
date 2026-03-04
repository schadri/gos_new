import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return ''
  // If we already have a full HTTP(S) URL (e.g. Google OAuth, legacy uploads), return it.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Otherwise, construct public URL with cache-busting query param
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${supabaseUrl}/storage/v1/object/public/${path}?t=${Date.now()}`
}
