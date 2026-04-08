'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context'
import { signOut } from '@/lib/firebase/auth-actions'
import { getUserVisions, VisionDoc } from '@/lib/firebase/firestore'

const FREE_DAILY_LIMIT = 3

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [totalVisions, setTotalVisions] = useState(0)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      getUserVisions(user.uid).then(visions => {
        setTotalVisions(visions.filter((v: VisionDoc) => v.status === 'completed').length)
      })
    }
  }, [user])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

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
          <Link href="/create" className="text-sm text-gray-400 hover:text-white">만들기</Link>
          <Link href="/history" className="text-sm text-gray-400 hover:text-white">히스토리</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

        {/* 프로필 */}
        <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 mb-4">
          <div className="flex items-center gap-4 mb-4">
            {profile.avatarUrl ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image src={profile.avatarUrl} alt="프로필" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">👤</div>
            )}
            <div>
              <p className="font-medium">{profile.email}</p>
              <p className="text-sm text-gray-400">
                {profile.plan === 'premium'
                  ? <span className="text-purple-400">✦ 프리미엄 플랜</span>
                  : '무료 플랜'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">오늘 생성 횟수</p>
              <p className="text-xl font-bold">
                {profile.dailyCount}
                <span className="text-sm text-gray-500 font-normal">
                  {profile.plan === 'free' ? `/${FREE_DAILY_LIMIT}` : ' (무제한)'}
                </span>
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">총 생성 수</p>
              <p className="text-xl font-bold">{totalVisions}<span className="text-sm text-gray-500 font-normal">개</span></p>
            </div>
          </div>
        </div>

        {/* 셀카 변경 */}
        <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 mb-4">
          <h2 className="font-semibold mb-2">셀카 변경</h2>
          <p className="text-gray-500 text-sm mb-3">새 셀카를 업로드하면 이후 생성 이미지에 반영됩니다.</p>
          <Link
            href="/onboarding"
            className="inline-flex px-4 py-2 border border-gray-700 hover:border-gray-500 text-sm text-gray-300 rounded-lg transition-colors"
          >
            셀카 다시 업로드
          </Link>
        </div>

        {/* 구독 */}
        {profile.plan === 'free' && (
          <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 mb-4">
            <h2 className="font-semibold mb-2">플랜 업그레이드</h2>
            <p className="text-gray-500 text-sm mb-3">프리미엄으로 매일 무제한 생성하세요.</p>
            <Link
              href="/pricing"
              className="inline-flex px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-medium text-white rounded-lg transition-colors"
            >
              프리미엄 업그레이드
            </Link>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full py-3 border border-gray-800 hover:border-gray-700 text-gray-500 hover:text-gray-400 rounded-xl transition-colors text-sm"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
