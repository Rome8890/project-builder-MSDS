'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) { setError('JPG, PNG, WebP 파일만 업로드 가능합니다.'); return }
    if (f.size > MAX_SIZE) { setError('파일 크기는 5MB 이하여야 합니다.'); return }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress(20)

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/selfie.${ext}`

    setProgress(50)
    const { error: uploadErr } = await supabase.storage
      .from('selfies')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      setError('업로드에 실패했습니다. 다시 시도해 주세요.')
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(80)
    const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(path)

    const { error: updateErr } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateErr) {
      setError('프로필 저장에 실패했습니다.')
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(100)
    router.push('/create')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative w-56 h-56 mx-auto rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200 ${
          preview
            ? 'border-purple-500 shadow-lg shadow-purple-900/30'
            : 'border-gray-700 hover:border-purple-700 hover:bg-gray-800/30'
        }`}
      >
        {preview ? (
          <Image src={preview} alt="셀카 미리보기" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
            <span className="text-5xl">📸</span>
            <p className="text-sm font-medium">클릭하여 셀카 선택</p>
            <p className="text-xs text-gray-600">JPG · PNG · WebP · 최대 5MB</p>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">클릭하여 변경</span>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden" onChange={handleFileChange} />

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {uploading && (
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
      >
        {uploading ? '업로드 중...' : '다음으로 →'}
      </button>
    </div>
  )
}
