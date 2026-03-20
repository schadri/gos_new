import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Supabase Storage path (e.g. "avatars/user-id/avatar.jpg")
 * into a public URL. Optional cache-busting timestamp can be added.
 * If passed a full URL already, returns it as-is.
 */
export function getAvatarUrl(path: string | null | undefined, withTimestamp = false): string | null {
  if (!path) return null

  // If it's already a full URL, return it as-is
  if (path.startsWith('http')) return path

  // Clean the path: remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  const [pathWithoutQuery] = cleanPath.split('?')

  // Storage paths are like "avatars/userId/avatar.jpg"
  const parts = pathWithoutQuery.split('/')
  const bucketName = parts[0]
  const filePath = parts.slice(1).join('/')

  // Ensure NEXT_PUBLIC_SUPABASE_URL is available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_SUPABASE_URL is missing')
    }
    return null
  }

  // Ensure supabaseUrl doesn't have a trailing slash for consistent concatenation
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl

  const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
  
  if (withTimestamp) {
    const timestamp = Math.floor(Date.now() / 1000)
    return `${publicUrl}?t=${timestamp}`
  }

  return publicUrl
}
