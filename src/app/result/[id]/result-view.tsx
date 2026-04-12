'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Vision {
  id: string
  user_id: string
  prompt: string
  image_url: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  is_public: boolean
  created_at: string
}

export default function ResultView({ vision: initial }: { vision: Vision }) {
  const [vision, setVision] = useState(initial)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Realtime 구독 (실시간 상태 변경 감지) ──
  useEffect(() => {
    if (vision.status === 'completed' || vision.status === 'failed') return

    // Supabase Realtime
    const channel = supabase
      .channel(`vision:${vision.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'visions',
        filter: `id=eq.${vision.id}`,
      }, payload => setVision(payload.new as Vision))
      .subscribe()

    // 폴백: 3초마다 HTTP 폴링
    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('visions')
        .select('*')
        .eq('id', vision.id)
        .single()
      if (data) setVision(data as Vision)
    }, 3000)

    return () => {
      supabase.removeChannel(channel)
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [vision.id, vision.status, supabase])

  // 완료되면 폴링 중단
  useEffect(() => {
    if ((vision.status === 'completed' || vision.status === 'failed') && pollingRef.current) {
      clearInterval(pollingRef.current)
    }
  }, [vision.status])

  async function handleDownload() {
    if (!vision.image_url) return
    try {
      const res = await fetch(vision.image_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `miraclevision-${vision.id}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(vision.image_url, '_blank')
    }
  }

  async function togglePublic() {
    const { data } = await supabase
      .from('visions')
      .update({ is_public: !vision.is_public })
      .eq('id', vision.id)
      .select()
      .single()
    if (data) setVision(data as Vision)
  }

  async function handleCopy() {
    const url = `${window.location.origin}/share/${vision.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${vision.id}` : ''

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          미라클<span className="text-purple-400">비전</span>
        </Link>
        <Link href="/create" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← 다시 만들기
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-14">

        {/* 생성 중 */}
        {(vision.status === 'pending' || vision.status === 'processing') && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-7 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-600/20 border-t-purple-600 animate-spin" />
              <div
                className="absolute inset-3 rounded-full border-4 border-pink-600/20 border-b-pink-500 animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              />
            </div>
            <h2 className="text-2xl font-bold mb-3">AI가 이미지를 생성하고 있습니다</h2>
            <p className="text-gray-400 mb-2">10~30초 정도 소요됩니다.</p>
            <p className="text-gray-600 text-sm italic">&quot;{vision.prompt}&quot;</p>
            <div className="mt-8 flex justify-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 실패 */}
        {vision.status === 'failed' && (
          <div className="text-center py-24">
            <div className="text-6xl mb-5">😢</div>
            <h2 className="text-2xl font-bold mb-3">이미지 생성에 실패했습니다</h2>
            <p className="text-gray-400 mb-7 text-sm">
              API 키 설정을 확인하거나 잠시 후 다시 시도해 주세요.
            </p>
            <Link
              href="/create"
              className="px-7 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
            >
              다시 만들기
            </Link>
          </div>
        )}

        {/* 완료 */}
        {vision.status === 'completed' && vision.image_url && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">비전보드 완성!</h1>
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-gray-400 text-sm mb-7 italic">&quot;{vision.prompt}&quot;</p>

            {/* 이미지 */}
            <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl">
              <Image
                src={vision.image_url}
                alt={vision.prompt}
                width={1024}
                height={1024}
                className="w-full h-auto"
                priority
                unoptimized={vision.image_url.includes('picsum.photos')}
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-xs text-gray-300">
                미라클비전 AI
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleDownload}
                className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PNG 다운로드
              </button>
              <button
                onClick={togglePublic}
                className={`flex-1 py-3.5 border font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                  vision.is_public
                    ? 'border-purple-600 text-purple-300 bg-purple-900/20'
                    : 'border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                {vision.is_public ? '🔓 공개됨' : '🔗 공유 링크 만들기'}
              </button>
            </div>

            {/* 공유 링크 */}
            {vision.is_public && (
              <div className="p-4 bg-gray-900/60 border border-gray-700 rounded-xl mb-6">
                <p className="text-xs text-gray-500 mb-1.5">공유 링크</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-purple-300 break-all flex-1">{shareUrl}</p>
                  <button
                    onClick={handleCopy}
                    className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link href="/history" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                내 비전보드 히스토리 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
