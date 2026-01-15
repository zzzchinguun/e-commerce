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
    default: 'MSTORE - Бүх зүйлээ энд',
    template: '%s | MSTORE',
  },
  description:
    'Итгэмжлэгдсэн худалдагчдын сая сая бүтээгдэхүүнээс сонгоорой. Электроник, хувцас, гэр ахуйн бараа болон бусад бүтээгдэхүүнийг хурдан хүргэлт, хямд үнээр худалдаж аваарай.',
  keywords: [
    'цахим худалдаа',
    'онлайн дэлгүүр',
    'MSTORE',
    'онлайн худалдаа',
    'электроник',
    'хувцас',
    'гэр ахуй',
    'монгол',
  ],
  authors: [{ name: 'MSTORE' }],
  creator: 'MSTORE',
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    siteName: 'MSTORE',
    title: 'MSTORE - Бүх зүйлээ энд',
    description:
      'Итгэмжлэгдсэн худалдагчдын сая сая бүтээгдэхүүнээс сонгоорой. Электроник, хувцас, гэр ахуйн бараа болон бусад.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MSTORE - Бүх зүйлээ энд',
    description:
      'Итгэмжлэгдсэн худалдагчдын сая сая бүтээгдэхүүнээс сонгоорой. Электроник, хувцас, гэр ахуйн бараа болон бусад.',
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
    <html lang="mn" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
