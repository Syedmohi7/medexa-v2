import 'globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'MEDEXA – AI-Powered Health Assistant',
  description: 'Your personal virtual health companion powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
