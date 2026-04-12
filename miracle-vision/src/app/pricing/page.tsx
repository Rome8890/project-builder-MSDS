import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ctaHref = user ? '/create' : '/auth/signup'

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">미라클<span className="text-purple-400">비전</span></Link>
        {user ? (
          <Link href="/create" className="text-sm text-gray-400 hover:text-white">만들기</Link>
        ) : (
          <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white">로그인</Link>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-extrabold mb-4">요금제</h1>
        <p className="text-gray-400 mb-16">무료로 시작하고, 필요할 때 업그레이드하세요</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
          {/* Free */}
          <div className="p-8 rounded-2xl border border-white/10 bg-gray-900/40">
            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-4">FREE</p>
            <p className="text-5xl font-extrabold mb-1">₩0</p>
            <p className="text-gray-500 text-sm mb-8">영원히 무료</p>
            <ul className="space-y-3 text-sm text-gray-400 mb-8">
              {['하루 3회 AI 이미지 생성', '이미지 다운로드 (PNG)', '생성 히스토리', '공유 링크 생성'].map(f => (
                <li key={f} className="flex gap-2.5"><span className="text-green-400">✓</span>{f}</li>
              ))}
            </ul>
            <Link href={ctaHref} className="block w-full py-3.5 border border-gray-700 hover:border-gray-500 text-center font-medium rounded-xl transition-colors">
              무료로 시작
            </Link>
          </div>

          {/* Premium */}
          <div className="relative p-8 rounded-2xl border-2 border-purple-600 bg-purple-900/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-purple-600 rounded-full text-sm font-semibold">가장 인기</div>
            <p className="text-xs font-semibold text-purple-400 tracking-widest mb-4">PREMIUM</p>
            <p className="text-5xl font-extrabold mb-1">₩9,900</p>
            <p className="text-gray-500 text-sm mb-8">/ 월 · 언제든 해지 가능</p>
            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              {[
                '무제한 AI 이미지 생성',
                '고화질 PNG 다운로드',
                'Canva 템플릿 20+ 선택',
                '인스타·틱톡 공유 카드',
                '친구 초대 보너스 지급',
                '우선 처리 (빠른 생성)',
              ].map(f => (
                <li key={f} className="flex gap-2.5"><span className="text-purple-400">✓</span>{f}</li>
              ))}
            </ul>
            <Link href={ctaHref} className="block w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-center font-semibold rounded-xl transition-colors">
              프리미엄 시작하기
            </Link>
          </div>
        </div>

        <p className="mt-14 text-gray-600 text-sm">Polar로 안전하게 결제 처리 · VAT 포함</p>

        <div className="mt-14 text-left max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">자주 묻는 질문</h2>
          {[
            { q: '무료 3회는 언제 초기화되나요?', a: '매일 자정(00:00)에 초기화됩니다.' },
            { q: '셀카가 외부에 공개되나요?', a: '아니요. 셀카는 오직 AI 이미지 생성에만 사용되며, 본인 외 누구도 볼 수 없습니다.' },
            { q: '구독을 언제든 취소할 수 있나요?', a: '네, 언제든지 마이페이지에서 구독을 취소할 수 있습니다. 취소 후 만료일까지 사용 가능합니다.' },
          ].map(({ q, a }) => (
            <div key={q} className="mb-5 p-5 bg-gray-900/60 rounded-xl border border-gray-800">
              <p className="font-medium mb-2">{q}</p>
              <p className="text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
