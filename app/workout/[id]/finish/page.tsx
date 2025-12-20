import { supabase } from '@/lib/supabase'
import { formatForStrava } from '@/lib/strava'
import { calculateAllProgressions } from '@/lib/progression'
import FinishScreen from '@/components/FinishScreen'
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
      exercise:exercises!session_entries_exercise_id_fkey(*)
    `)
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error fetching session entries:', error)
    return []
  }

  return data
}

async function getExercises(workoutTypeId: string) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_type_id', workoutTypeId)

  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }

  return data
}

export default async function FinishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(id)

  if (!session) {
    notFound()
  }

  const entries = await getSessionEntries(id)
  const exercises = await getExercises(session.workout_type_id)

  // Generate Strava text
  const stravaText = formatForStrava(
    (session as any).workout_types?.name || 'Workout',
    entries as any,
    { includeNotes: false }
  )

  // Calculate progressions
  const progressions = calculateAllProgressions(
    exercises,
    entries as any,
    false // microloading disabled by default
  )

  return (
    <FinishScreen
      session={session as any}
      stravaText={stravaText}
      progressions={progressions}
    />
  )
}
