import { supabase } from '@/lib/supabase'
import { formatForStrava } from '@/lib/strava'
import HistoryDetail from '@/components/HistoryDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getSession(sessionId: string): Promise<any> {
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
      exercise:exercises!session_entries_exercise_id_fkey(*)
    `)
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error fetching session entries:', error)
    return []
  }

  return data
}

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(id)

  if (!session) {
    notFound()
  }

  const entries = await getSessionEntries(id)

  // Generate Strava text
  const stravaText = formatForStrava(
    session.workout_types?.name || 'Workout',
    entries as any,
    { includeNotes: false }
  )

  return <HistoryDetail session={session} entries={entries as any} stravaText={stravaText} />
}
