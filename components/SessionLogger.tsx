'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'
import { saveEntriesLocally, getEntriesLocally } from '@/lib/session-storage'
import { queueMutation, isOnline, processQueue } from '@/lib/offline-queue'
import type { Database } from '@/lib/database.types'

type Exercise = Database['public']['Tables']['exercises']['Row']
type SessionEntry = Database['public']['Tables']['session_entries']['Row']
type Session = Database['public']['Tables']['sessions']['Row'] & {
  workout_types?: { name: string } | null
}

interface Props {
  session: Session
  exercises: Exercise[]
  previousEntries: SessionEntry[]
  existingEntries: SessionEntry[]
}

interface EntryState {
  exerciseId: string
  weight: number | null
  sets: number
  reps: number
  note: string
  completed: boolean
  showNote: boolean
}

export default function SessionLogger({ session, exercises, previousEntries, existingEntries }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<EntryState[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [offline, setOffline] = useState(!isOnline())

  // Initialize entries with prefill logic
  useEffect(() => {
    const initialEntries: EntryState[] = exercises.map((exercise) => {
      // Check if there's an existing entry for this session
      const existing = existingEntries.find((e) => e.exercise_id === exercise.id)
      if (existing) {
        return {
          exerciseId: exercise.id,
          weight: existing.weight,
          sets: existing.sets,
          reps: existing.reps,
          note: existing.note || '',
          completed: existing.completed,
          showNote: !!existing.note,
        }
      }

      // Otherwise prefill from previous entry or template
      const previous = previousEntries.find((e) => e.exercise_id === exercise.id)
      return {
        exerciseId: exercise.id,
        weight: previous?.weight ?? exercise.default_weight,
        sets: previous?.sets ?? exercise.default_sets,
        reps: previous?.reps ?? exercise.default_reps,
        note: '',
        completed: false,
        showNote: false,
      }
    })

    setEntries(initialEntries)
  }, [exercises, previousEntries, existingEntries])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOffline(false)
      processQueue(supabase)
    }
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Autosave locally
  useEffect(() => {
    const timer = setTimeout(() => {
      saveEntriesLocally(session.id, entries as any)
    }, 500)

    return () => clearTimeout(timer)
  }, [entries, session.id])

  const updateEntry = useCallback((exerciseId: string, updates: Partial<EntryState>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.exerciseId === exerciseId ? { ...entry, ...updates } : entry
      )
    )
  }, [])

  const handleFinish = async () => {
    setIsSaving(true)

    try {
      // Save all entries to database
      const entriesToSave = entries.map((entry) => ({
        session_id: session.id,
        user_id: DEFAULT_USER_ID,
        exercise_id: entry.exerciseId,
        weight: entry.weight,
        sets: entry.sets,
        reps: entry.reps,
        note: entry.note || null,
        completed: entry.completed,
      }))

      if (offline) {
        // Queue for later sync
        await queueMutation({
          type: 'insert',
          table: 'session_entries',
          data: entriesToSave,
        })
      } else {
        // Delete existing entries and insert new ones
        await supabase.from('session_entries').delete().eq('session_id', session.id)
        await supabase.from('session_entries').insert(entriesToSave)
      }

      // Mark session as finished
      const finishData = {
        finished_at: new Date().toISOString(),
      }

      if (offline) {
        await queueMutation({
          type: 'update',
          table: 'sessions',
          data: { id: session.id, ...finishData },
        })
      } else {
        await supabase.from('sessions').update(finishData).eq('id', session.id)
      }

      // Navigate to finish screen
      router.push(`/workout/${session.id}/finish`)
    } catch (error) {
      console.error('Error saving session:', error)
      alert('Error saving workout. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-foundation p-4 pb-24">
      {/* Header */}
      <header className="mb-6 sticky top-0 bg-foundation pt-4 pb-2 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textWhite">
              {session.workout_types?.name || 'Workout'}
            </h1>
            <p className="text-muted text-sm">
              {new Date(session.started_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {offline && (
            <div className="bg-muted/20 text-muted px-3 py-1 rounded text-xs">
              Offline
            </div>
          )}
        </div>
      </header>

      {/* Exercise entries */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {exercises.map((exercise, index) => {
          const entry = entries.find((e) => e.exerciseId === exercise.id)
          if (!entry) return null

          return (
            <div
              key={exercise.id}
              className="bg-surface border border-primary/10 rounded-lg p-4"
            >
              {/* Exercise name and completion */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-textWhite">{exercise.name}</h3>
                <button
                  onClick={() => updateEntry(exercise.id, { completed: !entry.completed })}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    entry.completed
                      ? 'bg-primary text-foundation'
                      : 'bg-surface border border-muted text-muted'
                  }`}
                >
                  {entry.completed ? '✓ Done' : 'Mark done'}
                </button>
              </div>

              {/* Input fields */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-muted text-xs mb-1">
                    {exercise.unit === 'sec' ? 'Time (s)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    step={exercise.unit === 'sec' ? '1' : '0.25'}
                    value={entry.weight ?? ''}
                    onChange={(e) =>
                      updateEntry(exercise.id, {
                        weight: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full bg-foundation border border-muted/30 rounded px-3 py-2 text-textWhite focus:outline-none focus:border-primary"
                    disabled={exercise.unit === 'sec'}
                  />
                </div>
                <div>
                  <label className="block text-muted text-xs mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={entry.sets}
                    onChange={(e) =>
                      updateEntry(exercise.id, { sets: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-foundation border border-muted/30 rounded px-3 py-2 text-textWhite focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted text-xs mb-1">
                    {exercise.unit === 'sec' ? 'Seconds' : 'Reps'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={entry.reps}
                    onChange={(e) =>
                      updateEntry(exercise.id, { reps: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-foundation border border-muted/30 rounded px-3 py-2 text-textWhite focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Note toggle and input */}
              {!entry.showNote ? (
                <button
                  onClick={() => updateEntry(exercise.id, { showNote: true })}
                  className="text-muted hover:text-textWhite text-sm"
                >
                  + Add note
                </button>
              ) : (
                <div>
                  <label className="block text-muted text-xs mb-1">Note</label>
                  <input
                    type="text"
                    value={entry.note}
                    onChange={(e) => updateEntry(exercise.id, { note: e.target.value })}
                    placeholder="Form, feeling, etc."
                    className="w-full bg-foundation border border-muted/30 rounded px-3 py-2 text-textWhite text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-foundation border-t border-primary/20 p-4">
        <button
          onClick={handleFinish}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-foundation font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Finish Workout'}
        </button>
      </div>
    </div>
  )
}
