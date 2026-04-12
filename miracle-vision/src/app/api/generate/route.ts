import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const FREE_LIMIT = 3

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { prompt, userId } = await request.json()

  if (!prompt?.trim()) {
    return NextResponse.json({ error: '목표를 입력해 주세요.' }, { status: 400 })
  }
  if (user.id !== userId) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const admin = createAdminClient()

  // 프로필 조회
  const { data: profile } = await admin
    .from('users')
    .select('plan, daily_count, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile?.avatar_url) {
    return NextResponse.json({ error: '셀카를 먼저 업로드해 주세요.' }, { status: 400 })
  }

  // 일일 횟수 초기화 (날짜가 바뀐 경우)
  const today = new Date().toISOString().slice(0, 10)
  const { data: lastReset } = await admin
    .from('users')
    .select('daily_reset_at')
    .eq('id', user.id)
    .single()

  let currentCount = profile.daily_count
  if (lastReset?.daily_reset_at !== today) {
    currentCount = 0
    await admin.from('users').update({ daily_count: 0, daily_reset_at: today }).eq('id', user.id)
  }

  if (profile.plan === 'free' && currentCount >= FREE_LIMIT) {
    return NextResponse.json({ error: '오늘 무료 생성 횟수를 모두 사용했습니다.' }, { status: 429 })
  }

  // vision 레코드 생성
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

  // 비동기 이미지 생성
  generateImageAsync(vision.id, prompt.trim(), profile.avatar_url, user.id)

  return NextResponse.json({ visionId: vision.id })
}

async function generateImageAsync(
  visionId: string,
  prompt: string,
  avatarUrl: string,
  userId: string
) {
  const admin = createAdminClient()

  try {
    const apiKey = process.env.FLUX_API_KEY
    if (!apiKey) throw new Error('FLUX_API_KEY not configured')

    // Flux Pro 1.1 Ultra 호출
    const fluxRes = await fetch('https://api.bfl.ml/v1/flux-pro-1.1-ultra', {
      method: 'POST',
      headers: { 'X-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Photorealistic portrait: a person who has successfully achieved their dream of "${prompt}".
Confident, happy expression. Cinematic lighting, professional photography, 8K quality.
The person matches the reference photo provided.`,
        image_prompt: avatarUrl,
        width: 1024,
        height: 1024,
        output_format: 'jpeg',
        safety_tolerance: 2,
      }),
    })

    if (!fluxRes.ok) throw new Error(`Flux API error: ${fluxRes.status}`)
    const { id: requestId } = await fluxRes.json()

    // 폴링 (최대 90초)
    let imageUrl: string | null = null
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const poll = await fetch(`https://api.bfl.ml/v1/get_result?id=${requestId}`, {
        headers: { 'X-Key': apiKey },
      })
      const pollData = await poll.json()
      if (pollData.status === 'Ready' && pollData.result?.sample) {
        imageUrl = pollData.result.sample; break
      }
      if (pollData.status === 'Error') throw new Error('Generation failed')
    }

    if (!imageUrl) throw new Error('Generation timeout')

    // Supabase Storage에 저장
    const imgRes = await fetch(imageUrl)
    const imgBlob = await imgRes.blob()
    const storagePath = `${userId}/${visionId}.jpg`

    const { error: storageErr } = await admin.storage
      .from('visions')
      .upload(storagePath, imgBlob, { contentType: 'image/jpeg', upsert: true })

    if (storageErr) throw storageErr

    const { data: { publicUrl } } = admin.storage.from('visions').getPublicUrl(storagePath)

    await admin.from('visions').update({ image_url: publicUrl, status: 'completed' }).eq('id', visionId)
  } catch (err) {
    console.error('[generate]', err)
    await admin.from('visions').update({ status: 'failed' }).eq('id', visionId)
  }
}
