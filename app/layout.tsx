import type { Metadata } from 'next'
import './globals.css'
import RegisterServiceWorker from './register-sw'

export const metadata: Metadata = {
  title: 'LUKA FORGE',
  description: 'Workout logger and training companion',
  manifest: '/manifest.json',
  themeColor: '#0A0A0A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LUKA FORGE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  )
}
