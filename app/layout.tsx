// app/layout.tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { clerkEnabled } from '@/lib/clerk-config'
import SupabaseHealthBanner from '@/components/SupabaseHealthBanner'

const inter = Inter({ variable: '--font-sans', subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ProvenVA — Hire Virtual Assistants Who Are Already Proven',
  description: 'Every VA on ProvenVA has passed skill tests, background checks, and portfolio reviews before you see them. Stop wasting time vetting. Start hiring.',
  openGraph: {
    title: 'ProvenVA',
    description: 'Skill-tested virtual assistants, ready to hire.',
    url: 'https://provenva.com',
    siteName: 'ProvenVA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-white text-gray-900`}>
        <SupabaseHealthBanner />
        {clerkEnabled ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  )
}
