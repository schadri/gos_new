import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Supabase Storage path (e.g. "avatars/user-id/avatar.jpg")
 * into a public URL with a cache-busting timestamp.
 * If passed a full URL already, returns it as-is with cache-busting appended.
 */
export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null

  // If it's already a full URL, return it as-is (the new logic below is for Supabase storage paths)
  // Note: The original code added cache-busting to http paths, this new logic does not.
  if (path.startsWith('http')) return path

  // Use a granular cache-buster (every second) to ensure immediate feedback on change
  const timestamp = Math.floor(Date.now() / 1000)

  // Storage paths are like "avatars/userId/avatar.jpg" or "documents/userId/cv.pdf"
  const parts = path.split('/')
  const bucketName = parts[0]
  const filePath = parts.slice(1).join('/').split('?')[0] // Strip any temporary query params from the path itself

  // Ensure NEXT_PUBLIC_SUPABASE_URL is available and correctly formatted
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
  return `${publicUrl}?t=${timestamp}`
}
