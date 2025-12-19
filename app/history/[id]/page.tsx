import { supabase } from '@/lib/supabase'
import { formatForStrava } from '@/lib/strava'
import HistoryDetail from '@/components/HistoryDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, workout_types(name)')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data
}

async function getSessionEntries(sessionId: string) {
  const { data, error } = await supabase
    .from('session_entries')
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error fetching session entries:', error)
    return []
  }

  return data
}

export default async function HistoryDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id)

  if (!session) {
    notFound()
  }

  const entries = await getSessionEntries(params.id)

  // Generate Strava text
  const stravaText = formatForStrava(
    session.workout_types?.name || 'Workout',
    entries as any,
    { includeNotes: false }
  )

  return <HistoryDetail session={session} entries={entries as any} stravaText={stravaText} />
}
