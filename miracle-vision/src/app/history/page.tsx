import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: visions } = await supabase
    .from('visions')
    .select('id, prompt, image_url, status, created_at, is_public')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">미라클<span className="text-purple-400">비전</span></Link>
        <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-medium rounded-lg transition-colors">
          + 새로 만들기
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">내 비전보드</h1>
          <span className="text-sm text-gray-500">{visions?.length ?? 0}개</span>
        </div>

        {!visions?.length ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-5">🖼️</div>
            <p className="text-gray-400 mb-6 text-lg">아직 만든 비전보드가 없습니다</p>
            <Link href="/create" className="inline-flex px-7 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors">
              첫 번째 비전보드 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visions.map(v => (
              <Link
                key={v.id}
                href={`/result/${v.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/8 hover:border-purple-500/50 transition-all duration-300 bg-gray-900"
              >
                {v.image_url ? (
                  <Image
                    src={v.image_url}
                    alt={v.prompt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {(v.status === 'processing' || v.status === 'pending') ? (
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                        <p className="text-xs text-gray-500">생성 중</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">생성 실패</p>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-xs text-white line-clamp-2 font-medium">{v.prompt}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(v.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {v.is_public && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600/80 rounded-full flex items-center justify-center text-xs">🔓</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
