import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

// Minimal root layout for the embedded widget iframe. This route renders
// inside every client website, so it must NOT load Clerk, analytics,
// structured data, or any app-shell providers — keep it as light as possible.

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ChatDock Assistant',
  robots: { index: false, follow: false },
}

export default function ChatbotLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
