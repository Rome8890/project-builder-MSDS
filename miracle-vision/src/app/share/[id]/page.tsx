import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

interface SharePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: vision } = await supabase
    .from('visions')
    .select('prompt, image_url')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!vision) return { title: '비전보드를 찾을 수 없습니다' }

  return {
    title: `${vision.prompt} | 미라클비전`,
    description: '미라클비전 AI가 만들어 준 비전보드입니다.',
    openGraph: {
      title: vision.prompt,
      description: '미라클비전 AI가 만들어 준 비전보드입니다.',
      images: vision.image_url ? [{ url: vision.image_url, width: 1024, height: 1024 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vision } = await supabase
    .from('visions')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!vision || !vision.image_url) notFound()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="text-2xl font-bold mb-8">
        미라클<span className="text-purple-400">비전</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10">
          <Image
            src={vision.image_url}
            alt={vision.prompt}
            width={1024}
            height={1024}
            className="w-full h-auto"
          />
        </div>

        <p className="text-center text-gray-300 italic mb-6">&quot;{vision.prompt}&quot;</p>

        <div className="text-center">
          <Link
            href="/auth/signup"
            className="inline-flex px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl transition-all hover:scale-105"
          >
            나도 비전보드 만들기 →
          </Link>
          <p className="mt-2 text-xs text-gray-600">무료로 시작 · 매일 3회 제공</p>
        </div>
      </div>
    </div>
  )
}
