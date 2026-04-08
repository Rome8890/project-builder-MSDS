'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/lib/firebase/config'
import { UserProfile } from '@/lib/firebase/firestore'

const FREE_DAILY_LIMIT = 3

const EXAMPLES = [
  '연봉 1억을 달성하고 최고급 오피스에서 일하는 나',
  '제주도 바다가 보이는 카페를 운영하는 나',
  '마라톤 완주 메달을 목에 걸고 웃는 나',
  '뉴욕 타임스퀘어에서 여행을 즐기는 나',
  '베스트셀러 작가로서 사인회를 하는 나',
]

export default function CreateForm({ profile }: { profile: UserProfile }) {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLimitReached =
    profile.plan === 'free' && profile.dailyCount >= FREE_DAILY_LIMIT

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('로그인이 필요합니다.')

      const token = await currentUser.getIdToken()
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '이미지 생성 실패'); return }

      router.push(`/result/${data.visionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (isLimitReached) {
    return (
      <div className="p-6 rounded-2xl border border-yellow-700/50 bg-yellow-900/10 text-center">
        <p className="text-yellow-300 font-medium mb-2">오늘 무료 생성 횟수를 모두 사용했습니다</p>
        <p className="text-gray-500 text-sm mb-4">자정에 초기화되거나 프리미엄으로 무제한 사용하세요.</p>
        <a href="/pricing" className="inline-flex px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">
          프리미엄 업그레이드
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 셀카 미리보기 */}
      <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-2xl border border-gray-800">
        {profile.avatarUrl ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image src={profile.avatarUrl} alt="내 셀카" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">👤</div>
        )}
        <div>
          <p className="text-sm text-white font-medium">내 셀카</p>
          <a href="/onboarding" className="text-xs text-purple-400 hover:text-purple-300">변경하기</a>
        </div>
      </div>

      {/* 목표 입력 */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">이루고 싶은 목표를 한 줄로</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="예: 연봉 1억을 달성하고 최고급 오피스에서 일하는 나"
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>구체적일수록 더 좋은 결과가 나와요</span>
          <span>{prompt.length}/200</span>
        </div>
      </div>

      {/* 예시 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">예시 목표</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              {ex.length > 22 ? ex.slice(0, 22) + '…' : ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!prompt.trim() || loading}
        className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-lg font-semibold rounded-2xl transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI가 생성 중... (10~30초)
          </span>
        ) : '✨ 비전보드 만들기'}
      </button>

      {profile.plan === 'free' && (
        <p className="text-center text-xs text-gray-600">
          오늘 {profile.dailyCount}/{FREE_DAILY_LIMIT}회 사용 ·{' '}
          <a href="/pricing" className="text-purple-400 hover:text-purple-300">프리미엄으로 무제한</a>
        </p>
      )}
    </form>
  )
}
