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
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          미라클<span className="text-purple-400">비전</span>
        </Link>
        <Link
          href="/create"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-medium rounded-lg transition-colors"
        >
          + 새로 만들기
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">내 비전보드 히스토리</h1>

        {!visions?.length ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-gray-400 mb-4">아직 만든 비전보드가 없습니다</p>
            <Link
              href="/create"
              className="inline-flex px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
            >
              첫 번째 비전보드 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visions.map((vision) => (
              <Link
                key={vision.id}
                href={`/result/${vision.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors"
              >
                {vision.image_url ? (
                  <Image
                    src={vision.image_url}
                    alt={vision.prompt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    {vision.status === 'processing' || vision.status === 'pending' ? (
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                        <p className="text-xs text-gray-500">생성 중</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-sm">실패</span>
                    )}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white line-clamp-2">{vision.prompt}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(vision.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
