import Link from 'next/link'
import { signUpWithEmail, signInWithOAuth } from '@/lib/supabase/auth-actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><h1 className="text-3xl font-bold">미라클<span className="text-purple-400">비전</span></h1></Link>
          <p className="mt-2 text-gray-400 text-sm">무료로 시작 · 신용카드 불필요</p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 border border-gray-800 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">회원가입</h2>

          {error && (
            <div className="mb-5 p-3.5 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}
          {message && (
            <div className="mb-5 p-3.5 bg-green-900/30 border border-green-700/50 rounded-xl text-green-300 text-sm">
              {decodeURIComponent(message)}
            </div>
          )}

          <form action={async () => { 'use server'; await signInWithOAuth('google') }}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl transition-colors mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 시작하기
            </button>
          </form>

          <form action={async () => { 'use server'; await signInWithOAuth('kakao') }}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] hover:bg-[#F4DC00] text-[#3C1E1E] font-medium rounded-xl transition-colors mb-6">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.74 5.19 4.37 6.61-.15.52-.97 3.37-1.01 3.64 0 0-.02.18.09.25.11.07.24.03.24.03.32-.04 3.66-2.4 4.25-2.82.34.05.69.07 1.06.07 5.52 0 10-3.48 10-7.78C22 6.48 17.52 3 12 3z"/>
              </svg>
              카카오로 시작하기
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-gray-900 px-3 text-gray-500">또는 이메일로</span></div>
          </div>

          <form action={signUpWithEmail} className="space-y-4">
            <input name="email" type="email" required placeholder="이메일"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            <input name="password" type="password" required minLength={8} placeholder="비밀번호 (8자 이상)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-purple-500 flex-shrink-0" />
              <span className="text-xs text-gray-400 leading-relaxed">
                이용약관 및 개인정보처리방침에 동의합니다. AI 이미지 생성 시 본인의 사진이 사용됨을 이해하고 동의합니다.
              </span>
            </label>
            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors">
              무료로 시작하기
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
