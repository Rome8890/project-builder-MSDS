import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDesc ?? errorParam)}`, origin)
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        const redirectTo = !profile?.avatar_url ? '/onboarding' : '/create'
        const forwardedHost = request.headers.get('x-forwarded-host')

        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`)
        }
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=인증에 실패했습니다', origin))
}
