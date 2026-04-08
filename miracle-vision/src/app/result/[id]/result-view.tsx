'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Vision } from '@/types/database'

export default function ResultView({ vision: initialVision }: { vision: Vision }) {
  const [vision, setVision] = useState(initialVision)
  const supabase = createClient()

  // Supabase Realtime으로 상태 변경 감지
  useEffect(() => {
    if (vision.status === 'completed' || vision.status === 'failed') return

    const channel = supabase
      .channel(`vision-${vision.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'visions', filter: `id=eq.${vision.id}` },
        (payload) => {
          setVision(payload.new as Vision)
        }
      )
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
    if (data) setVision(data)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          미라클<span className="text-purple-400">비전</span>
        </Link>
        <Link href="/create" className="text-sm text-gray-400 hover:text-white">
          ← 다시 만들기
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* 처리 중 */}
        {(vision.status === 'pending' || vision.status === 'processing') && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-600/30 border-t-purple-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">AI가 이미지를 생성하고 있습니다</h2>
            <p className="text-gray-400 text-sm">10~30초 정도 소요됩니다. 페이지를 닫지 마세요.</p>
            <p className="mt-3 text-gray-600 text-xs italic">&quot;{vision.prompt}&quot;</p>
          </div>
        )}

        {/* 실패 */}
        {vision.status === 'failed' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😢</div>
            <h2 className="text-xl font-semibold mb-2">이미지 생성에 실패했습니다</h2>
            <p className="text-gray-400 text-sm mb-6">잠시 후 다시 시도해 주세요.</p>
            <Link
              href="/create"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
            >
              다시 만들기
            </Link>
          </div>
        )}

        {/* 완료 */}
        {vision.status === 'completed' && vision.image_url && (
          <div>
            <h1 className="text-2xl font-bold mb-2">비전보드 완성! ✨</h1>
            <p className="text-gray-400 text-sm mb-6 italic">&quot;{vision.prompt}&quot;</p>

            <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/10">
              <Image
                src={vision.image_url}
                alt={vision.prompt}
                width={1024}
                height={1024}
                className="w-full h-auto"
                priority
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors text-center"
              >
                ⬇ PNG 다운로드
              </button>
              <button
                onClick={togglePublic}
                className={`flex-1 py-3 border font-medium rounded-xl transition-colors text-center ${
                  vision.is_public
                    ? 'border-purple-600 text-purple-400 hover:bg-purple-900/20'
                    : 'border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                {vision.is_public ? '🔓 공개됨 (비공개로 변경)' : '🔗 공유 링크 생성'}
              </button>
            </div>

            {vision.is_public && (
              <div className="mt-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">공유 링크</p>
                <p className="text-sm text-purple-300 break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/share/${vision.id}` : ''}
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/history" className="text-sm text-gray-500 hover:text-gray-300">
                내 비전보드 히스토리 보기 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
