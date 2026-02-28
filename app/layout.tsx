import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BottomNav } from '@/components/layout/bottom-nav'

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GOS - Empleos en Gastronomía y Hotelería',
  description: 'Conecta talento con las mejores oportunidades del sector gastronómico.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${font.className} flex min-h-screen flex-col antialiased bg-background`}>
        <Providers>
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
