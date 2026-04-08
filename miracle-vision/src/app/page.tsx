'use client'

import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const ctaHref = loading ? '#' : user ? '/create' : '/auth/signup'

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold">
            미라클<span className="text-purple-400">비전</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              요금제
            </Link>
            {!loading && (
              user ? (
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
              )
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-700/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/50 border border-purple-700/50 rounded-full text-purple-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            AI 비전보드 · 이미 이룬 미래를 지금 보세요
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            당신의 꿈을
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              이미지로 만들어 드립니다
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            셀카 한 장과 목표 한 줄만 입력하세요.<br />
            AI가 당신이 그 꿈을 이미 이룬 미래 사진을 만들어 드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-semibold rounded-2xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              무료로 시작하기 →
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-lg font-medium rounded-2xl transition-colors"
            >
              요금제 보기
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-600">신용카드 불필요 · 매일 3회 무료 생성</p>
        </div>
      </section>

      {/* 데모 */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-gray-900/50 aspect-video flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/20" />
          <div className="relative text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-gray-400 text-sm">AI가 생성한 비전보드 예시 이미지</p>
          </div>
        </div>
      </section>

      {/* 3단계 */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">3단계로 완성</h2>
          <p className="text-gray-400 text-center mb-16">30초면 충분합니다</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🤳', title: '셀카 업로드', desc: '본인 얼굴이 잘 나온 셀카 1장을 올려주세요.' },
              { step: '02', icon: '✍️', title: '목표 입력', desc: '"연봉 1억 달성", "유럽 여행" 등 꿈을 한 줄로 써보세요.' },
              { step: '03', icon: '🖼️', title: '이미지 생성', desc: 'AI가 당신이 꿈을 이룬 미래 사진을 만들어 드립니다.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="p-6 rounded-2xl border border-white/10 bg-gray-900/30 hover:border-purple-700/50 transition-colors">
                <span className="text-xs font-mono text-purple-500 mb-4 block">{step}</span>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요금제 요약 */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">심플한 요금제</h2>
          <p className="text-gray-400 mb-16">무료로 시작하고, 필요할 때 업그레이드하세요</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl border border-white/10 bg-gray-900/30 text-left">
              <p className="text-sm text-gray-400 mb-2">FREE</p>
              <p className="text-4xl font-bold mb-1">₩0</p>
              <p className="text-gray-500 text-sm mb-6">매일 3회 무료</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-green-400">✓</span> 하루 3회 AI 이미지 생성</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 이미지 다운로드</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span> 히스토리 보기</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-purple-600 bg-purple-900/20 text-left relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-600 rounded-full text-xs font-medium">인기</div>
              <p className="text-sm text-purple-300 mb-2">PREMIUM</p>
              <p className="text-4xl font-bold mb-1">₩9,900</p>
              <p className="text-gray-500 text-sm mb-6">/ 월</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-purple-400">✓</span> 무제한 AI 이미지 생성</li>
                <li className="flex gap-2"><span className="text-purple-400">✓</span> 고화질 다운로드</li>
                <li className="flex gap-2"><span className="text-purple-400">✓</span> Canva 템플릿 연동</li>
              </ul>
            </div>
          </div>
          <div className="mt-10">
            <Link href={ctaHref} className="inline-flex px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl transition-all hover:scale-105">
              지금 무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-gray-600 text-sm">© 2025 미라클비전. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-gray-400">이용약관</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
