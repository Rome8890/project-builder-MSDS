import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({ src: './fonts/GeistVF.woff', variable: '--font-geist-sans', weight: '100 900' })
const geistMono = localFont({ src: './fonts/GeistMonoVF.woff', variable: '--font-geist-mono', weight: '100 900' })

export const metadata: Metadata = {
  title: '미라클비전 — AI 비전보드 생성기',
  description: '셀카 한 장과 목표 한 줄로 AI가 당신의 꿈을 이룬 미래 이미지를 만들어 드립니다.',
  keywords: ['비전보드', 'AI 이미지', '목표 달성', '미라클모닝', '비전보드 만들기'],
  openGraph: {
    title: '미라클비전 — AI 비전보드 생성기',
    description: '셀카 한 장과 목표 한 줄로 AI가 당신의 꿈을 이룬 미래 이미지를 만들어 드립니다.',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
