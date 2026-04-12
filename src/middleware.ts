import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/onboarding', '/create', '/result', '/history', '/dashboard']

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경변수 없으면 그냥 통과 (500 방지)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    const isProtected = PROTECTED.some(p => pathname.startsWith(p))
    if (isProtected && !user) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/create', request.url))
    }
  } catch {
    // 인증 오류 시 그냥 통과
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
