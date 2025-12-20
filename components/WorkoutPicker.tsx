'use client'

import { useTransition } from 'react'
import Link from 'next/link'

interface WorkoutType {
  id: string
  name: string
  sort_order: number
}

interface Session {
  id: string
  started_at: string
  finished_at: string | null
  workout_types?: {
    name: string
  } | null
}

interface Props {
  workoutTypes: WorkoutType[]
  recentSessions: Session[]
  createSession: (workoutTypeId: string) => Promise<void>
}

export default function WorkoutPicker({ workoutTypes, recentSessions, createSession }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleWorkoutSelect = (workoutTypeId: string) => {
    startTransition(() => {
      createSession(workoutTypeId)
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Workout Type Buttons */}
      <div className="space-y-4 mb-12">
        {workoutTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleWorkoutSelect(type.id)}
            disabled={isPending}
            className="w-full glass-primary rounded-lg p-6 text-left transition-smooth hover:shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed btn-press animate-scale-in shadow-glass-inset"
          >
            <h2 className="text-2xl font-bold text-textWhite">{type.name}</h2>
            <p className="text-muted text-sm mt-1">Tap to start session</p>
          </button>
        ))}
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-textWhite mb-4">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.map((session) => {
              const finishedDate = session.finished_at
                ? new Date(session.finished_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'In progress'

              return (
                <Link
                  key={session.id}
                  href={`/history/${session.id}`}
                  className="block glass rounded-lg p-4 glass-hover"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-textWhite font-medium">
                      {session.workout_types?.name || 'Unknown'}
                    </span>
                    <span className="text-muted text-sm">{finishedDate}</span>
                  </div>
                </Link>
              )
            })}
          </div>
          <Link
            href="/history"
            className="block text-center text-primary hover:text-primary/80 mt-4 text-sm font-medium transition-smooth"
          >
            View all history →
          </Link>
        </div>
      )}
    </div>
  )
}
