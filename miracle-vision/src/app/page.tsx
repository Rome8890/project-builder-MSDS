import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ctaHref = user ? '/create' : '/auth/signup'

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            미라클<span className="text-purple-400">비전</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              요금제
            </Link>
            {user ? (
              <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-medium rounded-lg transition-colors">
                만들기 시작
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  로그인
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-medium rounded-lg transition-colors">
                  무료 시작
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-28 px-6 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-700/15 blur-[140px] rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/50 border border-purple-700/50 rounded-full text-purple-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            AI 비전보드 · 이미 이룬 미래를 지금 확인하세요
          </div>
          <h1 className="text-5xl md:text-[5.5rem] font-extrabold leading-[1.1] tracking-tight mb-7">
            당신의 꿈을
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              이미지로 만들어 드립니다
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            셀카 한 장과 목표 한 줄만 입력하세요.<br />
            AI가 당신이 그 꿈을 이미 이룬 미래 사진을 만들어 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link href={ctaHref} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-semibold rounded-2xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              무료로 시작하기 →
            </Link>
            <Link href="/pricing" className="px-8 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-lg font-medium rounded-2xl transition-colors">
              요금제 보기
            </Link>
          </div>
          <p className="text-sm text-gray-600">신용카드 불필요 · 매일 3회 무료 생성</p>
        </div>
      </section>

      {/* ── Demo image placeholder ── */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center bg-gray-950">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/10" />
          <div className="relative text-center space-y-3">
            <div className="text-7xl">✨</div>
            <p className="text-gray-400 text-sm font-medium">AI가 생성한 비전보드 예시</p>
            <p className="text-gray-700 text-xs">실제 생성 이미지로 업데이트 예정</p>
          </div>
          {/* 데코 카드들 */}
          <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/5 backdrop-blur rounded-xl border border-white/10 text-xs text-gray-300">
            🎯 연봉 1억 달성
          </div>
          <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-purple-500/20 backdrop-blur rounded-xl border border-purple-500/30 text-xs text-purple-300">
            ✨ AI 생성 완료
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 py-28 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">3단계로 완성</h2>
            <p className="text-gray-400">30초면 충분합니다</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '🤳', title: '셀카 업로드', desc: '본인 얼굴이 잘 나온 셀카 1장을 올려주세요. AI가 참고합니다.' },
              { step: '02', icon: '✍️', title: '목표 입력', desc: '"연봉 1억 달성", "유럽 여행" 같이 꿈을 한 줄로 써보세요.' },
              { step: '03', icon: '🖼️', title: '이미지 생성', desc: 'AI가 당신이 꿈을 이룬 미래 사진을 10~30초 안에 만들어 드립니다.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="group p-7 rounded-2xl border border-white/8 bg-gray-900/40 hover:bg-gray-900/60 hover:border-purple-700/40 transition-all duration-300">
                <span className="font-mono text-xs text-purple-500 mb-4 block">{step}</span>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-3">심플한 요금제</h2>
          <p className="text-gray-400 mb-14">무료로 시작하고, 필요할 때 업그레이드하세요</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            {/* Free */}
            <div className="p-7 rounded-2xl border border-white/10 bg-gray-900/40">
              <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">FREE</p>
              <p className="text-5xl font-extrabold mb-1">₩0</p>
              <p className="text-gray-500 text-sm mb-7">영원히 무료</p>
              <ul className="space-y-2.5 text-sm text-gray-400 mb-7">
                {['하루 3회 AI 이미지 생성', '이미지 다운로드 (PNG)', '생성 히스토리', '공유 링크 생성'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-green-400 mt-0.5">✓</span>{f}</li>
                ))}
              </ul>
              <Link href={ctaHref} className="block w-full py-3 border border-gray-700 hover:border-gray-500 text-center text-sm font-medium rounded-xl transition-colors">
                무료로 시작
              </Link>
            </div>
            {/* Premium */}
            <div className="relative p-7 rounded-2xl border-2 border-purple-600 bg-purple-900/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 rounded-full text-xs font-semibold">가장 인기</div>
              <p className="text-xs font-semibold text-purple-400 tracking-widest mb-3">PREMIUM</p>
              <p className="text-5xl font-extrabold mb-1">₩9,900</p>
              <p className="text-gray-500 text-sm mb-7">/ 월 · 언제든 해지 가능</p>
              <ul className="space-y-2.5 text-sm text-gray-300 mb-7">
                {['무제한 AI 이미지 생성', '고화질 PNG 다운로드', 'Canva 템플릿 20+ 선택', '인스타·틱톡 공유 카드', '친구 초대 보너스 지급', '우선 처리 (빠른 생성)'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-purple-400 mt-0.5">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-center text-sm font-semibold rounded-xl transition-colors">
                프리미엄 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-8">이미 많은 분들이 비전보드를 만들고 있습니다</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['"연봉 1억 달성한 내 모습을 매일 봐요" — 박○○', '"동기부여가 달라졌어요" — 김○○', '"신기하게 목표에 더 집중하게 됐어요" — 이○○'].map(q => (
              <div key={q} className="px-5 py-3 bg-gray-900/60 border border-white/8 rounded-xl text-sm text-gray-400 max-w-xs text-left">
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl border border-purple-700/30 bg-purple-900/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />
            <h2 className="relative text-3xl md:text-4xl font-bold mb-4">지금 바로 시작해보세요</h2>
            <p className="relative text-gray-400 mb-8">당신의 꿈을 이룬 미래를 오늘 만나보세요</p>
            <Link href={ctaHref} className="relative inline-flex px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-lg rounded-2xl transition-all hover:scale-105">
              무료로 비전보드 만들기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xl font-bold">미라클<span className="text-purple-400">비전</span></span>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
            <Link href="/pricing" className="hover:text-gray-400 transition-colors">요금제</Link>
          </div>
          <p className="text-gray-700 text-sm">© 2025 미라클비전. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
