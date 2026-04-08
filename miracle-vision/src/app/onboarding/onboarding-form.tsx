'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('JPG, PNG, WebP 파일만 업로드 가능합니다.')
      return
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setError(null)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/selfie.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('selfies')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('selfies')
      .getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      setError('프로필 저장 중 오류가 발생했습니다.')
      setUploading(false)
      return
    }

    router.push('/create')
  }

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors ${
          preview ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        {preview ? (
          <Image src={preview} alt="셀카 미리보기" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
            <span className="text-4xl">📸</span>
            <p className="text-sm">클릭하여 셀카 선택</p>
            <p className="text-xs text-gray-600">JPG · PNG · WebP · 최대 5MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
      >
        {uploading ? '업로드 중...' : '다음으로 →'}
      </button>
    </div>
  )
}
