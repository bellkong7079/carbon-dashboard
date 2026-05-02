import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Carbon Dashboard — PCF 탄소 관리 플랫폼',
  description: '제조업 실무자와 경영자를 위한 PCF 전과정 데이터 시각화 대시보드',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-gray-950 text-white min-h-screen flex">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
