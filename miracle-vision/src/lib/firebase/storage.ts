'use client'

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './config'

/**
 * 셀카 업로드 → Storage: selfies/{uid}/selfie.{ext}
 */
export async function uploadSelfie(uid: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storageRef = ref(storage, `selfies/${uid}/selfie.${ext}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

/**
 * 생성된 이미지 URL을 Blob으로 받아 Storage에 저장
 * visions/{uid}/{visionId}.jpg
 */
export async function saveGeneratedImage(
  uid: string,
  visionId: string,
  imageUrl: string
): Promise<string> {
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  const storageRef = ref(storage, `visions/${uid}/${visionId}.jpg`)
  const snapshot = await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(snapshot.ref)
}

/**
 * 셀카 삭제
 */
export async function deleteSelfie(uid: string) {
  const storageRef = ref(storage, `selfies/${uid}/selfie.jpg`)
  try {
    await deleteObject(storageRef)
  } catch {
    // 파일이 없을 수도 있음 — 무시
  }
}
