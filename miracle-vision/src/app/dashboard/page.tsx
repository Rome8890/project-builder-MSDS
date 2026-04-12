import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth-actions'
import Link from 'next/link'
import Image from 'next/image'

const FREE_LIMIT = 3

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, countRes, subRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('visions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').order('started_at', { ascending: false }).limit(1).single(),
  ])

  const profile = profileRes.data
  const totalCount = countRes.count ?? 0
  const subscription = subRes.data

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">미라클<span className="text-purple-400">비전</span></Link>
        <div className="flex items-center gap-5">
          <Link href="/create" className="text-sm text-gray-400 hover:text-white transition-colors">만들기</Link>
          <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">히스토리</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-14 space-y-4">
        <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

        {/* Profile card */}
        <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-4 mb-5">
            {profile?.avatar_url ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/30">
                <Image src={profile.avatar_url} alt="프로필" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">👤</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.email}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {profile?.plan === 'premium' ? (
                  <span className="text-purple-400 font-medium">✦ 프리미엄 플랜</span>
                ) : '무료 플랜'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '오늘 생성', value: `${profile?.daily_count ?? 0}${profile?.plan === 'free' ? `/${FREE_LIMIT}` : ''}` },
              { label: '총 생성', value: `${totalCount}개` },
              { label: '플랜', value: profile?.plan === 'premium' ? 'Premium' : 'Free' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-gray-800/60 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-800">
          <h2 className="font-semibold mb-3">구독 상태</h2>
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 font-medium">✦ 프리미엄 활성</p>
                <p className="text-gray-500 text-xs mt-1">
                  만료일: {new Date(subscription.expires_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-purple-900/50 border border-purple-700/50 rounded-full text-purple-300">활성</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">무료 플랜 사용 중</p>
                <p className="text-gray-600 text-xs mt-1">매일 3회 무료 생성</p>
              </div>
              <Link href="/pricing" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-medium rounded-lg transition-colors">
                업그레이드
              </Link>
            </div>
          )}
        </div>

        {/* Selfie */}
        <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-800">
          <h2 className="font-semibold mb-2">셀카 변경</h2>
          <p className="text-gray-500 text-sm mb-4">새 셀카를 업로드하면 이후 생성 이미지에 반영됩니다.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-500 text-sm text-gray-300 rounded-lg transition-colors">
            📸 셀카 다시 업로드
          </Link>
        </div>

        {/* Sign out */}
        <form action={signOut}>
          <button type="submit" className="w-full py-3.5 border border-gray-800 hover:border-gray-700 text-gray-500 hover:text-gray-400 rounded-xl transition-colors text-sm">
            로그아웃
          </button>
        </form>
      </div>
    </div>
  )
}
