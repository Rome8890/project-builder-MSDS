'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { uploadSelfie } from '@/lib/firebase/storage'
import { updateUserProfile } from '@/lib/firebase/firestore'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function OnboardingForm({ uid }: { uid: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED.includes(f.type)) { setError('JPG, PNG, WebP만 가능합니다.'); return }
    if (f.size > MAX_SIZE) { setError('파일 크기는 5MB 이하여야 합니다.'); return }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const downloadUrl = await uploadSelfie(uid, file)
      await updateUserProfile(uid, { avatarUrl: downloadUrl })
      router.push('/create')
    } catch (err) {
      console.error(err)
      setError('업로드에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative w-full max-w-xs mx-auto aspect-square rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors ${
          preview ? 'border-purple-500' : 'border-gray-700 hover:border-purple-700'
        }`}
      >
        {preview ? (
          <Image src={preview} alt="셀카 미리보기" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
            <span className="text-5xl">📸</span>
            <p className="text-sm">클릭하여 셀카 선택</p>
            <p className="text-xs text-gray-600">JPG · PNG · WebP · 최대 5MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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
