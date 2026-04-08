'use client'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from './config'
import { getOrCreateUserProfile } from './firestore'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// 이메일 로그인
export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await getOrCreateUserProfile(credential.user.uid, credential.user.email!)
  return credential.user
}

// 이메일 회원가입
export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await getOrCreateUserProfile(credential.user.uid, email)
  return credential.user
}

// Google 로그인
export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider)
  await getOrCreateUserProfile(
    credential.user.uid,
    credential.user.email!
  )
  return credential.user
}

// 로그아웃
export async function signOut() {
  await firebaseSignOut(auth)
}

// 현재 유저 감지 (훅용)
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
