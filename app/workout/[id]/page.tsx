import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'
import SessionLogger from '@/components/SessionLogger'
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

async function getExercises(workoutTypeId: string) {
  // Fetch ALL exercises for this workout type
  // SessionLogger will filter to show only show_by_default=true initially
  // The rest are available via "+ Add Exercise" button
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_type_id', workoutTypeId)
    .order('sort_order')

  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }

  return data
}

async function getPreviousEntries(exerciseIds: string[]) {
  if (exerciseIds.length === 0) return []

  const { data, error } = await supabase
    .from('session_entries')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .in('exercise_id', exerciseIds)
    .eq('completed', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching previous entries:', error)
    return []
  }

  // Get the most recent entry for each exercise
  const latestByExercise = new Map()
  for (const entry of data) {
    if (!latestByExercise.has(entry.exercise_id)) {
      latestByExercise.set(entry.exercise_id, entry)
    }
  }

  return Array.from(latestByExercise.values())
}

async function getSessionEntries(sessionId: string) {
  const { data, error } = await supabase
    .from('session_entries')
    .select('*')
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error fetching session entries:', error)
    return []
  }

  return data
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(id)

  if (!session) {
    notFound()
  }

  const exercises = await getExercises(session.workout_type_id)
  const exerciseIds = exercises.map((e) => e.id)
  const previousEntries = await getPreviousEntries(exerciseIds)
  const existingEntries = await getSessionEntries(id)

  return (
    <SessionLogger
      session={session}
      exercises={exercises}
      previousEntries={previousEntries}
      existingEntries={existingEntries}
    />
  )
}
