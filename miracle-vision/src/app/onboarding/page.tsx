'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import OnboardingForm from './onboarding-form'

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/auth/login'); return }
    if (profile?.avatarUrl) router.replace('/create')
  }, [user, profile, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            미라클<span className="text-purple-400">비전</span>
          </h1>
          <p className="mt-3 text-gray-400">시작하기 전에 셀카를 업로드해 주세요</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">1</div>
            <div>
              <p className="text-white font-medium">셀카 업로드</p>
              <p className="text-gray-500 text-xs">AI가 당신의 얼굴을 미래 이미지에 합성합니다</p>
            </div>
          </div>
          <div className="ml-11 mb-6 p-3 bg-yellow-900/20 border border-yellow-700/40 rounded-lg text-yellow-300 text-xs leading-relaxed">
            본인의 사진만 업로드하세요. 셀카는 AI 이미지 생성에만 사용됩니다.
          </div>

          <OnboardingForm uid={user.uid} />
        </div>
      </div>
    </div>
  )
}
