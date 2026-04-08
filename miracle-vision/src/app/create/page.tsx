'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import CreateForm from './create-form'

export default function CreatePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/auth/login'); return }
    if (profile && !profile.avatarUrl) router.replace('/onboarding')
  }, [user, profile, loading, router])

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          미라클<span className="text-purple-400">비전</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/history" className="text-sm text-gray-400 hover:text-white">히스토리</Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">마이페이지</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">비전보드 만들기</h1>
        <p className="text-gray-400 mb-8">이루고 싶은 목표를 입력하면 AI가 미래 사진을 만들어 드립니다.</p>
        <CreateForm profile={profile} />
      </div>
    </div>
  )
}
