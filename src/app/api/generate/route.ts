import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Vercel 함수 최대 실행 시간 (Pro: 300, Hobby: 60)
export const maxDuration = 60

const FREE_LIMIT = 3

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json()
  const { prompt, userId } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: '목표를 입력해 주세요.' }, { status: 400 })
  }
  if (user.id !== userId) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const admin = createAdminClient()
  const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
    .replace(/\. /g, '-').replace('.', '')

  // 프로필 조회
  const { data: profile, error: profileErr } = await admin
    .from('users')
    .select('plan, daily_count, daily_reset_at, avatar_url')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile) {
    return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
  }
  if (!profile.avatar_url) {
    return NextResponse.json({ error: '셀카를 먼저 업로드해 주세요.' }, { status: 400 })
  }

  // 일일 횟수 초기화 (날짜가 바뀐 경우)
  let currentCount = profile.daily_count
  if (profile.daily_reset_at !== today) {
    currentCount = 0
    await admin.from('users').update({ daily_count: 0, daily_reset_at: today }).eq('id', user.id)
  }

  if (profile.plan === 'free' && currentCount >= FREE_LIMIT) {
    return NextResponse.json(
      { error: '오늘 무료 생성 횟수(3회)를 모두 사용했습니다.' },
      { status: 429 }
    )
  }

  // vision 레코드 생성 (processing 상태)
  const { data: vision, error: visionErr } = await admin
    .from('visions')
    .insert({ user_id: user.id, prompt: prompt.trim(), status: 'processing' })
    .select()
    .single()

  if (visionErr || !vision) {
    return NextResponse.json({ error: '생성 기록 저장 실패' }, { status: 500 })
  }

  // 횟수 증가
  await admin.from('users').update({ daily_count: currentCount + 1 }).eq('id', user.id)

  // ============================================================
  // 이미지 생성 — 동기식 (Vercel 함수가 살아있는 동안 완료)
  // ============================================================
  const imageUrl = await generateImage(prompt.trim(), profile.avatar_url)

  if (imageUrl) {
    // Storage에 저장
    const stored = await saveToStorage(admin, imageUrl, user.id, vision.id)
    const finalUrl = stored ?? imageUrl

    await admin.from('visions')
      .update({ image_url: finalUrl, status: 'completed' })
      .eq('id', vision.id)
  } else {
    await admin.from('visions').update({ status: 'failed' }).eq('id', vision.id)
  }

  return NextResponse.json({ visionId: vision.id })
}

// ── Flux 이미지 생성 ──────────────────────────────────────────
async function generateImage(prompt: string, avatarUrl: string): Promise<string | null> {
  const apiKey = process.env.FLUX_API_KEY

  // DEMO MODE: API 키 없을 때 더미 이미지 반환 (테스트용)
  if (!apiKey) {
    console.warn('[generate] FLUX_API_KEY not set — using demo placeholder')
    await new Promise(r => setTimeout(r, 2000)) // 2초 딜레이 (생성 흉내)
    return `https://picsum.photos/seed/${Date.now()}/1024/1024`
  }

  try {
    // Flux Pro 1.1 Ultra 요청
    const submitRes = await fetch('https://api.bfl.ml/v1/flux-pro-1.1-ultra', {
      method: 'POST',
      headers: { 'X-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Photorealistic portrait: A confident, successful person who has achieved: "${prompt}".
Warm cinematic lighting, professional photography, sharp focus. 8K resolution.
Based on the person in the reference image.`,
        image_prompt: avatarUrl,
        width: 1024,
        height: 1024,
        output_format: 'jpeg',
        safety_tolerance: 2,
        seed: Math.floor(Math.random() * 999999),
      }),
    })

    if (!submitRes.ok) {
      const errText = await submitRes.text()
      console.error('[flux] submit error:', submitRes.status, errText)
      return null
    }

    const { id: requestId } = await submitRes.json()
    if (!requestId) return null

    // 폴링 (최대 55초 — Vercel 60초 limit 여유 5초 확보)
    const deadline = Date.now() + 55_000
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3000))

      const pollRes = await fetch(`https://api.bfl.ml/v1/get_result?id=${requestId}`, {
        headers: { 'X-Key': apiKey },
      })

      if (!pollRes.ok) continue

      const poll = await pollRes.json()

      if (poll.status === 'Ready' && poll.result?.sample) {
        return poll.result.sample as string
      }
      if (poll.status === 'Error') {
        console.error('[flux] generation error:', poll)
        return null
      }
    }

    console.error('[flux] timeout')
    return null
  } catch (err) {
    console.error('[flux] exception:', err)
    return null
  }
}

// ── Supabase Storage에 이미지 저장 ──────────────────────────
async function saveToStorage(
  admin: ReturnType<typeof createAdminClient>,
  imageUrl: string,
  uid: string,
  visionId: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return null

    const blob = await res.blob()
    const path = `${uid}/${visionId}.jpg`

    const { error } = await admin.storage
      .from('visions')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true })

    if (error) {
      console.error('[storage] upload error:', error)
      return imageUrl // 원본 URL 폴백
    }

    const { data: { publicUrl } } = admin.storage.from('visions').getPublicUrl(path)
    return publicUrl
  } catch (err) {
    console.error('[storage] exception:', err)
    return imageUrl // 원본 URL 폴백
  }
}
