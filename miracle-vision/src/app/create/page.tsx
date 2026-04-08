import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateForm from './create-form'

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

  const FREE_DAILY_LIMIT = 3
  const isLimitReached = profile.plan === 'free' && profile.daily_count >= FREE_DAILY_LIMIT

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold">
          미라클<span className="text-purple-400">비전</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {profile.plan === 'premium' ? (
              <span className="text-purple-400 font-medium">✦ 프리미엄</span>
            ) : (
              `오늘 ${profile.daily_count}/${FREE_DAILY_LIMIT}회 사용`
            )}
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">비전보드 만들기</h1>
        <p className="text-gray-400 mb-8">이루고 싶은 목표를 입력하면 AI가 미래 사진을 만들어 드립니다.</p>

        {isLimitReached ? (
          <div className="p-6 rounded-2xl border border-yellow-700/50 bg-yellow-900/10 text-center">
            <p className="text-yellow-300 font-medium mb-2">오늘 무료 생성 횟수를 모두 사용했습니다</p>
            <p className="text-gray-500 text-sm mb-4">내일 자정에 횟수가 초기화되거나, 프리미엄으로 무제한 사용하세요.</p>
            <a
              href="/pricing"
              className="inline-flex px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
            >
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
