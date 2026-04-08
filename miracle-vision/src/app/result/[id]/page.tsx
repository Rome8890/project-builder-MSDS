import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ResultView from './result-view'

interface ResultPageProps {
  params: Promise<{ id: string }>
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: vision } = await supabase
    .from('visions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!vision) notFound()

  return <ResultView vision={vision} />
}
