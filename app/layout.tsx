import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TekJeep AI',
  description: 'Real Jeep Tech Answers Powered by Grok',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">{children}</body>
    </html>
  )
}
