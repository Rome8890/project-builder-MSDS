'use client'

import { useState, useEffect } from 'react'
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
  const supabase = createClient()

  // Supabase Realtime 구독 — 이미지 완료 시 자동 업데이트
  useEffect(() => {
    if (vision.status === 'completed' || vision.status === 'failed') return

    const channel = supabase
      .channel(`vision:${vision.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'visions',
        filter: `id=eq.${vision.id}`,
      }, payload => setVision(payload.new as Vision))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [vision.id, vision.status, supabase])

  async function handleDownload() {
    if (!vision.image_url) return
    const res = await fetch(vision.image_url)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `miraclevision-${vision.id}.jpg`
    a.click()
    URL.revokeObjectURL(url)
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

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${vision.id}`
    : ''

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">미라클<span className="text-purple-400">비전</span></Link>
        <Link href="/create" className="text-sm text-gray-400 hover:text-white transition-colors">← 다시 만들기</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-14">
        {/* Processing */}
        {(vision.status === 'pending' || vision.status === 'processing') && (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-7 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-600/20 border-t-purple-600 animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-pink-600/20 border-b-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3">AI가 이미지를 생성하고 있습니다</h2>
            <p className="text-gray-400 mb-4">10~30초 정도 소요됩니다. 페이지를 닫지 마세요.</p>
            <p className="text-gray-600 text-sm italic">&quot;{vision.prompt}&quot;</p>
            <div className="mt-8 flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Failed */}
        {vision.status === 'failed' && (
          <div className="text-center py-24">
            <div className="text-6xl mb-5">😢</div>
            <h2 className="text-2xl font-bold mb-3">이미지 생성에 실패했습니다</h2>
            <p className="text-gray-400 mb-7">잠시 후 다시 시도해 주세요.</p>
            <Link href="/create" className="px-7 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors">
              다시 만들기
            </Link>
          </div>
        )}

        {/* Completed */}
        {vision.status === 'completed' && vision.image_url && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">비전보드 완성!</h1>
              <span className="text-2xl animate-pulse">✨</span>
            </div>
            <p className="text-gray-400 text-sm mb-7 italic">&quot;{vision.prompt}&quot;</p>

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl shadow-purple-900/20">
              <Image
                src={vision.image_url}
                alt={vision.prompt}
                width={1024}
                height={1024}
                className="w-full h-auto"
                priority
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-xs text-gray-300">
                미라클비전 AI
              </div>
            </div>

            {/* Actions */}
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
                    ? 'border-purple-600 text-purple-300 bg-purple-900/20 hover:bg-purple-900/30'
                    : 'border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                {vision.is_public ? (
                  <><span>🔓</span> 공개됨 (비공개로 변경)</>
                ) : (
                  <><span>🔗</span> 공유 링크 만들기</>
                )}
              </button>
            </div>

            {vision.is_public && (
              <div className="p-4 bg-gray-900/60 border border-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 mb-1.5">공유 링크</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-purple-300 break-all flex-1">{shareUrl}</p>
                  <button
                    onClick={() => navigator.clipboard?.writeText(shareUrl)}
                    className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/history" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                내 비전보드 히스토리 전체 보기 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
