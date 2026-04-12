import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('visions')
    .select('prompt, image_url')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!data) return { title: '비전보드를 찾을 수 없습니다 | 미라클비전' }
  return {
    title: `${data.prompt} | 미라클비전`,
    description: '미라클비전 AI가 만들어 준 비전보드입니다.',
    openGraph: {
      title: data.prompt,
      description: 'AI가 만든 나의 꿈 이미지',
      images: data.image_url ? [{ url: data.image_url, width: 1024, height: 1024 }] : [],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: vision } = await supabase
    .from('visions')
    .select('prompt, image_url, created_at')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!vision?.image_url) notFound()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="text-2xl font-bold mb-10">
        미라클<span className="text-purple-400">비전</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="relative rounded-2xl overflow-hidden mb-5 border border-white/10 shadow-2xl">
          <Image src={vision.image_url} alt={vision.prompt} width={1024} height={1024} className="w-full h-auto" priority />
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-xs text-gray-300">
            미라클비전 AI
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-300 italic mb-1">&quot;{vision.prompt}&quot;</p>
          <p className="text-gray-600 text-xs">
            {new Date(vision.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 생성
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/auth/signup"
            className="inline-flex px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl transition-all hover:scale-105"
          >
            나도 비전보드 만들기 →
          </Link>
          <p className="mt-3 text-xs text-gray-600">무료로 시작 · 매일 3회 제공</p>
        </div>
      </div>
    </div>
  )
}
