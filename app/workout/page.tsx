import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'
import WorkoutPicker from '@/components/WorkoutPicker'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/database.types'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

type SessionWithWorkoutType = Database['public']['Tables']['sessions']['Row'] & {
  workout_types?: { name: string } | null
}

async function getWorkoutTypes() {
  const { data, error } = await supabase
    .from('workout_types')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error('Error fetching workout types:', error)
    return []
  }

  return (data || []) as Database['public']['Tables']['workout_types']['Row'][]
}

async function getRecentSessions(): Promise<SessionWithWorkoutType[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      workout_types (
        name
      )
    `)
    .eq('user_id', DEFAULT_USER_ID)
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent sessions:', error)
    return []
  }

  return data as SessionWithWorkoutType[]
}

async function createSession(workoutTypeId: string) {
  'use server'

  const { data, error } = await (supabase as any)
    .from('sessions')
    .insert({
      user_id: DEFAULT_USER_ID,
      workout_type_id: workoutTypeId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return
  }

  redirect(`/workout/${data.id}`)
}

export default async function WorkoutPage() {
  const workoutTypes = await getWorkoutTypes()
  const recentSessions = await getRecentSessions()

  return (
    <div className="min-h-screen bg-foundation p-4">
      <header className="mb-8 animate-fade-in flex items-center gap-4">
        <Image
          src="/favicon.png"
          alt="LUKA FORGE"
          width={48}
          height={48}
          className="w-12 h-12"
        />
        <div>
          <p className="text-muted">Select your workout</p>
        </div>
      </header>

      <WorkoutPicker
        workoutTypes={workoutTypes}
        recentSessions={recentSessions}
        createSession={createSession}
      />
    </div>
  )
}
