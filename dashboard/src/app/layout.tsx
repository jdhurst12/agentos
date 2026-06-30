import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AgentOS Mission Control',
  description: 'AI Agent Management Operating System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#080810] text-slate-100 min-h-screen antialiased`}>
        {/* Animated grid background */}
        <div className="grid-bg" aria-hidden="true" />
        {/* Animated aurora orbs */}
        <div className="aurora-orb aurora-orb-1" aria-hidden="true" />
        <div className="aurora-orb aurora-orb-2" aria-hidden="true" />
        <div className="aurora-orb aurora-orb-3" aria-hidden="true" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
