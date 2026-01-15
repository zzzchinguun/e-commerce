import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Providers } from '@/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Marketplace - Shop Everything',
    template: '%s | Marketplace',
  },
  description:
    'Discover millions of products from trusted sellers. Shop electronics, clothing, home goods, and more with fast shipping and great prices.',
  keywords: [
    'e-commerce',
    'online shopping',
    'marketplace',
    'buy online',
    'electronics',
    'clothing',
    'home goods',
  ],
  authors: [{ name: 'Marketplace' }],
  creator: 'Marketplace',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Marketplace',
    title: 'Marketplace - Shop Everything',
    description:
      'Discover millions of products from trusted sellers. Shop electronics, clothing, home goods, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketplace - Shop Everything',
    description:
      'Discover millions of products from trusted sellers. Shop electronics, clothing, home goods, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
