'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const FREE_LIMIT = 3
const EXAMPLES = [
  '연봉 1억을 달성하고 최고급 오피스에서 일하는 나',
  '제주도 바다가 보이는 카페를 운영하는 나',
  '마라톤 완주 메달을 목에 걸고 환하게 웃는 나',
  '뉴욕 타임스퀘어 앞에서 여행을 즐기는 나',
  '베스트셀러 작가로서 사인회를 하는 나',
]

interface Props {
  userId: string
  avatarUrl: string
  dailyCount: number
  plan: 'free' | 'premium'
}

export default function CreateForm({ userId, avatarUrl, dailyCount, plan }: Props) {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), userId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '이미지 생성에 실패했습니다.'); setLoading(false); return }
      router.push(`/result/${data.visionId}`)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Selfie preview */}
      <div className="flex items-center gap-4 p-4 bg-gray-900/60 rounded-2xl border border-gray-800">
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-500/30">
          <Image src={avatarUrl} alt="셀카" fill className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">내 셀카</p>
          <a href="/onboarding" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">변경하기</a>
        </div>
        {plan === 'premium' && (
          <span className="ml-auto text-xs px-2.5 py-1 bg-purple-900/50 border border-purple-700/40 rounded-full text-purple-300">✦ 무제한</span>
        )}
      </div>

      {/* Prompt input */}
      <div>
        <label className="block text-sm text-gray-400 mb-2 font-medium">
          이루고 싶은 목표를 한 줄로 입력하세요
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="예: 연봉 1억을 달성하고 최고급 오피스에서 일하는 나"
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3.5 bg-gray-900 border border-gray-700 text-white rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
        />
        <div className="flex justify-between mt-1.5 text-xs text-gray-600">
          <span>구체적일수록 더 좋은 결과가 나와요</span>
          <span>{prompt.length}/200</span>
        </div>
      </div>

      {/* Example prompts */}
      <div>
        <p className="text-xs text-gray-500 mb-2.5">예시 목표 (클릭해서 입력)</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 text-xs bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-purple-700/50 text-gray-300 rounded-lg transition-all"
            >
              {ex.length > 22 ? ex.slice(0, 22) + '…' : ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!prompt.trim() || loading}
        className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-lg font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-purple-500/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI가 생성 중입니다... (10~30초)
          </span>
        ) : '✨ 비전보드 만들기'}
      </button>

      {plan === 'free' && (
        <p className="text-center text-xs text-gray-600">
          오늘 {dailyCount}/{FREE_LIMIT}회 사용 ·{' '}
          <a href="/pricing" className="text-purple-400 hover:text-purple-300 transition-colors">프리미엄으로 무제한 사용</a>
        </p>
      )}
    </form>
  )
}
