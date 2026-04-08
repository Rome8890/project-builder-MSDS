import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          미라클<span className="text-purple-400">비전</span>
        </Link>
        {user ? (
          <Link href="/create" className="text-sm text-gray-400 hover:text-white">만들기</Link>
        ) : (
          <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white">로그인</Link>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold mb-4">요금제</h1>
        <p className="text-gray-400 mb-16">무료로 시작하고, 필요할 때 업그레이드하세요</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* 무료 */}
          <div className="p-8 rounded-2xl border border-white/10 bg-gray-900/30 text-left">
            <p className="text-sm text-gray-400 mb-3">FREE</p>
            <p className="text-5xl font-extrabold mb-1">₩0</p>
            <p className="text-gray-500 text-sm mb-8">영원히 무료</p>
            <ul className="space-y-3 text-sm text-gray-400 mb-8">
              <li className="flex gap-2"><span className="text-green-400">✓</span> 하루 3회 AI 이미지 생성</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> 이미지 다운로드 (PNG)</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> 히스토리 보기</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> 공유 링크 생성</li>
            </ul>
            <Link
              href={user ? '/create' : '/auth/signup'}
              className="block w-full py-3 border border-gray-700 hover:border-gray-500 text-center text-gray-300 font-medium rounded-xl transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>

          {/* 프리미엄 */}
          <div className="p-8 rounded-2xl border-2 border-purple-600 bg-purple-900/10 text-left relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 rounded-full text-xs font-semibold">
              가장 인기
            </div>
            <p className="text-sm text-purple-300 mb-3">PREMIUM</p>
            <p className="text-5xl font-extrabold mb-1">₩9,900</p>
            <p className="text-gray-500 text-sm mb-8">/ 월 · 언제든 해지 가능</p>
            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex gap-2"><span className="text-purple-400">✓</span> 무제한 AI 이미지 생성</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> 고화질 PNG 다운로드</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> Canva 템플릿 20+ 선택</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> 인스타·틱톡 공유 카드</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> 친구 초대 보너스</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> 우선 생성 (빠른 처리)</li>
            </ul>
            <Link
              href={user ? '/api/checkout' : '/auth/signup?redirect=/pricing'}
              className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-center text-white font-semibold rounded-xl transition-colors"
            >
              프리미엄 시작하기
            </Link>
          </div>
        </div>

        <p className="mt-12 text-gray-600 text-sm">
          결제는 Polar를 통해 안전하게 처리됩니다 · VAT 포함
        </p>
      </div>
    </div>
  )
}
