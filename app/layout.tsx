import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RealtimeNotifications } from '@/components/layout/realtime-notifications'
import { createClient } from '@/lib/supabase/server'

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GOS - Empleos en Gastronomía y Hotelería',
  description: 'Conecta talento con las mejores oportunidades del sector gastronómico.',
  generator: 'GOS.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/apple-icon.png',
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user = null
  let isTalent = false

  try {
    const supabase = await createClient()
    
    // Add a timeout to prevent infinite hangs in local development
    const withTimeout = (promise: Promise<any>, ms: number) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), ms))
      ])
    }

    const { data: { user: authUser }, error: authError } = await withTimeout(supabase.auth.getUser(), 8000)
    
    if (authUser && !authError) {
      user = authUser
      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle()
      
      if (!profileError) {
        isTalent = profile?.user_type === 'TALENT' || user.user_metadata?.role === 'talent'
      }
    }
  } catch (error) {
    console.warn('RootLayout: Auth/Profile fetch stalled or failed:', error)
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${font.className} flex min-h-screen flex-col antialiased bg-background ${isTalent ? 'talent-theme' : ''}`}>
        <Providers>
          {user && <RealtimeNotifications userId={user.id} />}
          <Navbar />
          <main className="flex-1 w-full mx-auto">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
