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
        {/* Ambient glow orbs */}
        <div
          className="fixed pointer-events-none z-0"
          style={{
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="fixed pointer-events-none z-0"
          style={{
            bottom: '-20%',
            right: '-10%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(ellipse, rgba(6, 182, 212, 0.05) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
