'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Provider } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/', 'layout')
  redirect('/create')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: { emailRedirectTo: `${APP_URL}/auth/callback` },
  })
  if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
  redirect('/auth/signup?message=이메일을 확인해 인증을 완료해 주세요')
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${APP_URL}/auth/callback`,
      queryParams:
        provider === 'kakao'
          ? { prompt: 'login' }
          : { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
