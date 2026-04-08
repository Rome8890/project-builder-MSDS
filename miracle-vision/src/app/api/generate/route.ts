import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const FREE_DAILY_LIMIT = 3

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

  // 사용 횟수 체크
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('plan, daily_count, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
  }

  if (!profile.avatar_url) {
    return NextResponse.json({ error: '셀카를 먼저 업로드해 주세요.' }, { status: 400 })
  }

  if (profile.plan === 'free' && profile.daily_count >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: '오늘 무료 생성 횟수를 모두 사용했습니다.' },
      { status: 429 }
    )
  }

  // vision 레코드 생성 (pending 상태)
  const { data: vision, error: visionError } = await admin
    .from('visions')
    .insert({
      user_id: user.id,
      prompt: prompt.trim(),
      status: 'processing',
    })
    .select()
    .single()

  if (visionError || !vision) {
    return NextResponse.json({ error: '생성 기록을 저장하지 못했습니다.' }, { status: 500 })
  }

  // daily_count 증가
  await admin
    .from('users')
    .update({ daily_count: profile.daily_count + 1 })
    .eq('id', user.id)

  // Flux API 호출 (비동기 — 실제 구현 시 background job으로 분리 권장)
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
    const fluxApiKey = process.env.FLUX_API_KEY
    if (!fluxApiKey) throw new Error('Flux API 키가 설정되지 않았습니다.')

    // Flux API 호출
    const response = await fetch('https://api.bfl.ml/v1/flux-pro-1.1-ultra', {
      method: 'POST',
      headers: {
        'X-Key': fluxApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `A photorealistic image of a person who has achieved their goal: ${prompt}.
                 The person looks happy and successful. High quality, professional photography style.`,
        width: 1024,
        height: 1024,
        output_format: 'jpeg',
        safety_tolerance: 2,
      }),
    })

    if (!response.ok) throw new Error(`Flux API 오류: ${response.status}`)

    const result = await response.json()
    const requestId = result.id

    // 폴링으로 결과 대기 (최대 60초)
    let imageUrl: string | null = null
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000))

      const pollRes = await fetch(`https://api.bfl.ml/v1/get_result?id=${requestId}`, {
        headers: { 'X-Key': fluxApiKey },
      })
      const pollData = await pollRes.json()

      if (pollData.status === 'Ready' && pollData.result?.sample) {
        imageUrl = pollData.result.sample
        break
      }
      if (pollData.status === 'Error') throw new Error('이미지 생성 실패')
    }

    if (!imageUrl) throw new Error('이미지 생성 시간 초과')

    // 이미지를 Supabase Storage에 저장
    const imgResponse = await fetch(imageUrl)
    const imgBlob = await imgResponse.blob()
    const storagePath = `${userId}/${visionId}.jpg`

    const { error: storageError } = await admin.storage
      .from('visions')
      .upload(storagePath, imgBlob, { contentType: 'image/jpeg', upsert: true })

    if (storageError) throw storageError

    const { data: { publicUrl } } = admin.storage
      .from('visions')
      .getPublicUrl(storagePath)

    await admin
      .from('visions')
      .update({ image_url: publicUrl, status: 'completed' })
      .eq('id', visionId)
  } catch (err) {
    console.error('Image generation error:', err)
    await admin
      .from('visions')
      .update({ status: 'failed' })
      .eq('id', visionId)
  }
}
