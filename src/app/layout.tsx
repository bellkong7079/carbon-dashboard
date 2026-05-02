import type { Metadata } from 'next'
import { Syne, DM_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Carbon Dashboard — Industrial Precision',
  description: '제조업 실무자와 경영자를 위한 PCF 전과정 데이터 시각화 대시보드',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="antialiased min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', overflow: 'hidden' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-base)' }}>
          {children}
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
