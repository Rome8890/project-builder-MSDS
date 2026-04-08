import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'

// ── User ──────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  avatarUrl: string | null
  plan: 'free' | 'premium'
  dailyCount: number
  dailyResetAt: string   // ISO date string (YYYY-MM-DD)
  createdAt: Timestamp | null
}

export async function getOrCreateUserProfile(
  uid: string,
  email: string
): Promise<UserProfile> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return { id: uid, ...snap.data() } as UserProfile
  }

  const today = new Date().toISOString().slice(0, 10)
  const profile: Omit<UserProfile, 'id'> = {
    email,
    avatarUrl: null,
    plan: 'free',
    dailyCount: 0,
    dailyResetAt: today,
    createdAt: serverTimestamp() as unknown as Timestamp,
  }
  await setDoc(ref, profile)
  return { id: uid, ...profile }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: uid, ...snap.data() } as UserProfile
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'id'>>
) {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>)
}

/** 자정 초기화: 날짜가 바뀌면 dailyCount 리셋 */
export async function checkAndResetDailyCount(uid: string): Promise<UserProfile> {
  const profile = await getUserProfile(uid)
  if (!profile) throw new Error('Profile not found')

  const today = new Date().toISOString().slice(0, 10)
  if (profile.dailyResetAt !== today) {
    await updateUserProfile(uid, { dailyCount: 0, dailyResetAt: today })
    return { ...profile, dailyCount: 0, dailyResetAt: today }
  }
  return profile
}

// ── Vision ────────────────────────────────────────────
export interface VisionDoc {
  id: string
  userId: string
  prompt: string
  imageUrl: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  isPublic: boolean
  createdAt: Timestamp | null
}

export async function createVision(
  userId: string,
  prompt: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'visions'), {
    userId,
    prompt,
    imageUrl: null,
    status: 'processing',
    isPublic: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getVision(visionId: string): Promise<VisionDoc | null> {
  const snap = await getDoc(doc(db, 'visions', visionId))
  if (!snap.exists()) return null
  return { id: visionId, ...snap.data() } as VisionDoc
}

export async function getUserVisions(uid: string): Promise<VisionDoc[]> {
  const q = query(
    collection(db, 'visions'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() } as VisionDoc))
}

export function subscribeVision(
  visionId: string,
  callback: (vision: VisionDoc) => void
) {
  return onSnapshot(doc(db, 'visions', visionId), (snap) => {
    if (snap.exists()) callback({ id: visionId, ...snap.data() } as VisionDoc)
  })
}
