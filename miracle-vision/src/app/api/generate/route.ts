import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase/admin'

const FREE_DAILY_LIMIT = 3

export async function POST(request: NextRequest) {
  // Firebase ID 토큰으로 인증 확인
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  let uid: string
  try {
    const token = authorization.split('Bearer ')[1]
    const decoded = await adminAuth.verifyIdToken(token)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: '인증이 만료되었습니다.' }, { status: 401 })
  }

  const { prompt } = await request.json()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: '목표를 입력해 주세요.' }, { status: 400 })
  }

  // 사용자 프로필 조회
  const userRef = adminDb.collection('users').doc(uid)
  const userSnap = await userRef.get()
  if (!userSnap.exists) {
    return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
  }

  const profile = userSnap.data()!
  if (!profile.avatarUrl) {
    return NextResponse.json({ error: '셀카를 먼저 업로드해 주세요.' }, { status: 400 })
  }

  // 일일 횟수 초기화 (날짜 변경 시)
  const today = new Date().toISOString().slice(0, 10)
  let dailyCount = profile.dailyCount ?? 0
  if (profile.dailyResetAt !== today) {
    dailyCount = 0
    await userRef.update({ dailyCount: 0, dailyResetAt: today })
  }

  if (profile.plan === 'free' && dailyCount >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: '오늘 무료 생성 횟수를 모두 사용했습니다.' },
      { status: 429 }
    )
  }

  // vision 문서 생성 (processing 상태)
  const visionRef = await adminDb.collection('visions').add({
    userId: uid,
    prompt: prompt.trim(),
    imageUrl: null,
    status: 'processing',
    isPublic: false,
    createdAt: new Date(),
  })
  const visionId = visionRef.id

  // daily_count 증가
  await userRef.update({ dailyCount: dailyCount + 1 })

  // 비동기 이미지 생성 (응답 먼저 반환)
  generateImageAsync(visionId, prompt.trim(), profile.avatarUrl, uid)

  return NextResponse.json({ visionId })
}

async function generateImageAsync(
  visionId: string,
  prompt: string,
  avatarUrl: string,
  uid: string
) {
  const visionRef = adminDb.collection('visions').doc(visionId)

  try {
    const fluxApiKey = process.env.FLUX_API_KEY
    if (!fluxApiKey) throw new Error('FLUX_API_KEY not set')

    // Flux 1.1 Ultra API 호출
    const fluxRes = await fetch('https://api.bfl.ml/v1/flux-pro-1.1-ultra', {
      method: 'POST',
      headers: {
        'X-Key': fluxApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Photorealistic portrait of a person who has successfully achieved: "${prompt}".
Happy, confident expression. Professional photography, cinematic lighting, 8K quality.
The person looks exactly like the reference photo.`,
        image_prompt: avatarUrl,   // 셀카 IP-Adapter 기반 참조
        width: 1024,
        height: 1024,
        output_format: 'jpeg',
        safety_tolerance: 2,
      }),
    })

    if (!fluxRes.ok) throw new Error(`Flux API ${fluxRes.status}`)
    const { id: requestId } = await fluxRes.json()

    // 폴링 (최대 90초)
    let imageUrl: string | null = null
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const poll = await fetch(`https://api.bfl.ml/v1/get_result?id=${requestId}`, {
        headers: { 'X-Key': fluxApiKey },
      })
      const pollData = await poll.json()

      if (pollData.status === 'Ready' && pollData.result?.sample) {
        imageUrl = pollData.result.sample
        break
      }
      if (pollData.status === 'Error') throw new Error('Flux generation failed')
    }

    if (!imageUrl) throw new Error('Generation timeout')

    // Firebase Storage에 저장
    const imgRes = await fetch(imageUrl)
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    const bucket = adminStorage.bucket()
    const filePath = `visions/${uid}/${visionId}.jpg`
    const file = bucket.file(filePath)

    await file.save(imgBuffer, { contentType: 'image/jpeg' })
    await file.makePublic()

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`

    await visionRef.update({ imageUrl: publicUrl, status: 'completed' })
  } catch (err) {
    console.error('[generate] error:', err)
    await visionRef.update({ status: 'failed' })
  }
}
