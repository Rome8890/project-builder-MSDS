import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) redirect('/create')

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">미라클<span className="text-purple-400">비전</span></h1>
          <p className="mt-3 text-gray-400">시작하기 전에 셀카를 업로드해 주세요</p>
        </div>

        <div className="bg-gray-900/80 rounded-2xl p-8 border border-gray-800">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="text-white font-medium">셀카 업로드</p>
              <p className="text-gray-500 text-xs">AI가 당신의 얼굴을 미래 이미지에 합성합니다</p>
            </div>
          </div>

          <div className="ml-11 mb-6 p-3.5 bg-amber-900/20 border border-amber-700/30 rounded-xl text-amber-300 text-xs leading-relaxed">
            본인의 사진만 업로드하세요. 셀카는 AI 이미지 생성에만 사용되며 제3자에게 공개되지 않습니다.
          </div>

          <OnboardingForm userId={user.id} />
        </div>
      </div>
    </div>
  )
}
