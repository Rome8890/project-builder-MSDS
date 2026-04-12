import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateForm from './create-form'

const FREE_LIMIT = 3

export default async function CreatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('avatar_url, plan, daily_count')
    .eq('id', user.id)
    .single()

  if (!profile?.avatar_url) redirect('/onboarding')

  const isLimitReached = profile.plan === 'free' && profile.daily_count >= FREE_LIMIT

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">미라클<span className="text-purple-400">비전</span></a>
        <div className="flex items-center gap-5">
          <a href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">히스토리</a>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">마이페이지</a>
          {profile.plan === 'premium' ? (
            <span className="text-xs px-2.5 py-1 bg-purple-900/50 border border-purple-700/50 rounded-full text-purple-300">✦ 프리미엄</span>
          ) : (
            <span className="text-xs text-gray-500">오늘 {profile.daily_count}/{FREE_LIMIT}회</span>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-bold mb-2">비전보드 만들기</h1>
        <p className="text-gray-400 mb-10">이루고 싶은 목표를 입력하면 AI가 미래 사진을 만들어 드립니다.</p>

        {isLimitReached ? (
          <div className="p-7 rounded-2xl border border-amber-700/40 bg-amber-900/10 text-center">
            <div className="text-4xl mb-3">⏰</div>
            <p className="text-amber-300 font-semibold mb-2">오늘 무료 생성 횟수를 모두 사용했습니다</p>
            <p className="text-gray-500 text-sm mb-5">자정에 초기화되거나, 프리미엄으로 무제한 생성하세요.</p>
            <a href="/pricing" className="inline-flex px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">
              프리미엄 업그레이드
            </a>
          </div>
        ) : (
          <CreateForm
            userId={user.id}
            avatarUrl={profile.avatar_url}
            dailyCount={profile.daily_count}
            plan={profile.plan as 'free' | 'premium'}
          />
        )}
      </div>
    </div>
  )
}
