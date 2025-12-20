'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'
import { saveEntriesLocally } from '@/lib/session-storage'
import { queueMutation, isOnline, processQueue } from '@/lib/offline-queue'
import type { Database, SetData } from '@/lib/database.types'
import ExerciseSwapper from './ExerciseSwapper'
import Button from './ui/Button'
import FullscreenTimer from './FullscreenTimer'

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

interface SetEntry {
  set: number
  weight: number | null
  reps: number
}

interface EntryState {
  exerciseId: string

  // Simple mode (legacy)
  weight: number | null
  sets: number
  reps: number

  // Advanced mode
  isAdvancedMode: boolean
  setData: SetEntry[]

  // Exercise swapping
  swappedFromExerciseId: string | null
  displayExerciseId: string // The exercise to display (either original or swapped)

  note: string
  completed: boolean
  showNote: boolean
}

export default function SessionLogger({ session, exercises, previousEntries, existingEntries }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<EntryState[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [offline, setOffline] = useState(!isOnline())
  const [exerciseIdToSwap, setExerciseIdToSwap] = useState<string | null>(null)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [activeTimers, setActiveTimers] = useState<Map<string, number>>(new Map())
  const [timerIntervals, setTimerIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map())
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [restInterval, setRestInterval] = useState<NodeJS.Timeout | null>(null)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [fullscreenTimerState, setFullscreenTimerState] = useState<{
    isOpen: boolean
    exerciseId: string
    exerciseName: string
    totalSeconds: number
  } | null>(null)

  // Initialize entries with prefill logic
  useEffect(() => {
    // Only create entries for exercises that show by default OR were in existingEntries
    const exercisesToShow = exercises.filter(ex =>
      ex.show_by_default || existingEntries.some(e => e.exercise_id === ex.id)
    )

    const initialEntries: EntryState[] = exercisesToShow.map((exercise) => {
      // Check if there's an existing entry for this session
      const existing = existingEntries.find((e) => e.exercise_id === exercise.id)
      if (existing) {
        const hasSetData = existing.set_data && Array.isArray(existing.set_data)
        return {
          exerciseId: exercise.id,
          weight: existing.weight,
          sets: existing.sets,
          reps: existing.reps,
          isAdvancedMode: hasSetData,
          setData: hasSetData
            ? (existing.set_data as SetData[])
            : [{ set: 1, weight: existing.weight, reps: existing.reps }],
          swappedFromExerciseId: existing.swapped_from_exercise_id,
          displayExerciseId: existing.exercise_id,
          note: existing.note || '',
          completed: existing.completed,
          showNote: !!existing.note,
        }
      }

      // Otherwise prefill from previous entry or template
      const previous = previousEntries.find((e) => e.exercise_id === exercise.id)
      const hasSetData = previous?.set_data && Array.isArray(previous.set_data)

      return {
        exerciseId: exercise.id,
        weight: previous?.weight ?? exercise.default_weight,
        sets: previous?.sets ?? exercise.default_sets,
        reps: previous?.reps ?? exercise.default_reps,
        isAdvancedMode: hasSetData,
        setData: hasSetData
          ? (previous.set_data as SetData[]).map((s: SetData) => ({ ...s }))
          : [
              {
                set: 1,
                weight: previous?.weight ?? exercise.default_weight,
                reps: previous?.reps ?? exercise.default_reps,
              },
            ],
        swappedFromExerciseId: null,
        displayExerciseId: exercise.id,
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

  const toggleAdvancedMode = useCallback((exerciseId: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.exerciseId !== exerciseId) return entry

        if (!entry.isAdvancedMode) {
          // Switch to advanced: Convert current simple data to per-set
          const setData: SetEntry[] = Array.from({ length: entry.sets }, (_, i) => ({
            set: i + 1,
            weight: entry.weight,
            reps: entry.reps,
          }))

          return { ...entry, isAdvancedMode: true, setData }
        } else {
          // Switch to simple: Aggregate set data
          const weight = entry.setData[0]?.weight ?? null
          const reps = entry.setData[0]?.reps ?? 0
          const sets = entry.setData.length

          return { ...entry, isAdvancedMode: false, weight, reps, sets }
        }
      })
    )
  }, [])

  const updateSetData = useCallback(
    (exerciseId: string, setIndex: number, updates: Partial<SetEntry>) => {
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.exerciseId !== exerciseId) return entry

          const newSetData = [...entry.setData]
          newSetData[setIndex] = { ...newSetData[setIndex], ...updates }

          return { ...entry, setData: newSetData }
        })
      )
    },
    []
  )

  const addSet = useCallback((exerciseId: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.exerciseId !== exerciseId) return entry

        const lastSet = entry.setData[entry.setData.length - 1]
        const newSet: SetEntry = {
          set: entry.setData.length + 1,
          weight: lastSet?.weight ?? null,
          reps: lastSet?.reps ?? 1,
        }

        return { ...entry, setData: [...entry.setData, newSet] }
      })
    )
  }, [])

  const removeSet = useCallback((exerciseId: string, setIndex: number) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.exerciseId !== exerciseId || entry.setData.length <= 1) return entry

        const newSetData = entry.setData.filter((_, idx) => idx !== setIndex)
        // Renumber sets
        newSetData.forEach((set, idx) => {
          set.set = idx + 1
        })

        return { ...entry, setData: newSetData }
      })
    )
  }, [])

  const handleSwap = useCallback(
    (originalExerciseId: string, newExercise: Exercise) => {
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.exerciseId !== originalExerciseId) return entry

          // Update to use the new exercise
          return {
            ...entry,
            displayExerciseId: newExercise.id,
            swappedFromExerciseId: entry.swappedFromExerciseId || entry.exerciseId,
            // Optionally reset values to new exercise defaults
            weight: newExercise.default_weight,
            sets: newExercise.default_sets,
            reps: newExercise.default_reps,
            setData: [
              {
                set: 1,
                weight: newExercise.default_weight,
                reps: newExercise.default_reps,
              },
            ],
          }
        })
      )
    },
    []
  )

  const handleAddExercise = useCallback((newExercise: Exercise) => {
    // Add a new entry for this exercise
    const newEntry: EntryState = {
      exerciseId: newExercise.id,
      weight: newExercise.default_weight,
      sets: newExercise.default_sets,
      reps: newExercise.default_reps,
      isAdvancedMode: false,
      setData: [
        {
          set: 1,
          weight: newExercise.default_weight,
          reps: newExercise.default_reps,
        },
      ],
      swappedFromExerciseId: null,
      displayExerciseId: newExercise.id,
      note: '',
      completed: false,
      showNote: false,
    }

    setEntries((prev) => [...prev, newEntry])
    setShowAddExercise(false)
  }, [])

  const startTimer = useCallback((exerciseId: string, seconds: number) => {
    // Clear existing timer for this exercise if any
    const existingInterval = timerIntervals.get(exerciseId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Set initial time
    setActiveTimers(prev => new Map(prev).set(exerciseId, seconds))

    // Start countdown
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(exerciseId)
        if (current === undefined || current <= 1) {
          // Timer finished
          clearInterval(interval)
          setTimerIntervals(prev => {
            const newIntervals = new Map(prev)
            newIntervals.delete(exerciseId)
            return newIntervals
          })
          newMap.delete(exerciseId)
          return newMap
        }
        newMap.set(exerciseId, current - 1)
        return newMap
      })
    }, 1000)

    setTimerIntervals(prev => new Map(prev).set(exerciseId, interval))
  }, [timerIntervals])

  const stopTimer = useCallback((exerciseId: string) => {
    const interval = timerIntervals.get(exerciseId)
    if (interval) {
      clearInterval(interval)
      setTimerIntervals(prev => {
        const newMap = new Map(prev)
        newMap.delete(exerciseId)
        return newMap
      })
    }
    setActiveTimers(prev => {
      const newMap = new Map(prev)
      newMap.delete(exerciseId)
      return newMap
    })
  }, [timerIntervals])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timerIntervals.forEach(interval => clearInterval(interval))
      if (restInterval) clearInterval(restInterval)
    }
  }, [timerIntervals, restInterval])

  const startRestTimer = useCallback((seconds: number) => {
    // Clear existing rest timer if any
    if (restInterval) {
      clearInterval(restInterval)
    }

    // Set initial time
    setRestTimer(seconds)

    // Start countdown
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          // Timer finished
          clearInterval(interval)
          setRestInterval(null)
          return null
        }
        return prev - 1
      })
    }, 1000)

    setRestInterval(interval)
  }, [restInterval])

  const stopRestTimer = useCallback(() => {
    if (restInterval) {
      clearInterval(restInterval)
      setRestInterval(null)
    }
    setRestTimer(null)
  }, [restInterval])

  const openFullscreenTimer = useCallback((exerciseId: string, exerciseName: string, seconds: number) => {
    // Stop any existing timer for this exercise
    stopTimer(exerciseId)

    // Open fullscreen with initial state
    setFullscreenTimerState({
      isOpen: true,
      exerciseId,
      exerciseName,
      totalSeconds: seconds,
    })

    // Start the timer
    setActiveTimers(prev => new Map(prev).set(exerciseId, seconds))

    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(exerciseId)
        if (current === undefined || current <= 1) {
          clearInterval(interval)
          setTimerIntervals(prev => {
            const newIntervals = new Map(prev)
            newIntervals.delete(exerciseId)
            return newIntervals
          })
          newMap.delete(exerciseId)
          return newMap
        }
        newMap.set(exerciseId, current - 1)
        return newMap
      })
    }, 1000)

    setTimerIntervals(prev => new Map(prev).set(exerciseId, interval))
  }, [stopTimer])

  const closeFullscreenTimer = useCallback(() => {
    if (fullscreenTimerState) {
      stopTimer(fullscreenTimerState.exerciseId)
    }
    setFullscreenTimerState(null)
  }, [fullscreenTimerState, stopTimer])

  const handleFinish = async () => {
    setIsSaving(true)

    try {
      // Save all entries to database
      const entriesToSave = entries.map((entry) => {
        const saveData: any = {
          session_id: session.id,
          user_id: DEFAULT_USER_ID,
          exercise_id: entry.displayExerciseId, // Use the displayed exercise (swapped or original)
          completed: entry.completed,
          note: entry.note || null,
          swapped_from_exercise_id: entry.swappedFromExerciseId,
        }

        if (entry.isAdvancedMode) {
          // Advanced mode: Save per-set data
          saveData.set_data = entry.setData
          // Also save aggregates for backward compatibility
          saveData.weight = entry.setData[0]?.weight ?? null
          saveData.sets = entry.setData.length
          saveData.reps = Math.round(
            entry.setData.reduce((sum, s) => sum + s.reps, 0) / entry.setData.length
          )
        } else {
          // Simple mode: Save to both legacy and new format
          saveData.weight = entry.weight
          saveData.sets = entry.sets
          saveData.reps = entry.reps
          saveData.set_data = null
        }

        return saveData
      })

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

  // Calculate progress
  const totalExercises = entries.length
  const completedCount = entries.filter((e) => e.completed).length
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0

  return (
    <div className="min-h-screen bg-foundation p-4 pb-48">
      {/* Header */}
      <header className="mb-6 sticky top-0 bg-foundation pt-4 pb-2 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
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

          {/* Progress indicator */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-primary text-xl font-bold">
              {completedCount}/{totalExercises}
            </span>
            {offline && (
              <div className="bg-muted/20 text-muted px-2 py-1 rounded text-xs">
                Offline
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden shadow-glass-inset">
          <div
            className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out ${
              progressPercent > 0 ? 'shadow-glow-primary' : ''
            } ${progressPercent >= 90 ? 'animate-pulse-subtle' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Exercise entries */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {exercises.map((exercise) => {
          const entry = entries.find((e) => e.exerciseId === exercise.id)
          if (!entry) return null

          // Get the display exercise (might be swapped)
          const displayExercise = exercises.find((e) => e.id === entry.displayExerciseId) || exercise
          const isSwapped = entry.swappedFromExerciseId !== null

          return (
            <div
              key={exercise.id}
              className={`glass rounded-lg p-6 transition-smooth ${
                entry.completed ? 'shadow-glow-primary border-primary/30' : 'border-primary/10'
              }`}
            >
              {/* Exercise name, swap button, and completion */}
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-textWhite leading-tight">
                      {displayExercise.name}
                    </h3>
                    {isSwapped && (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-bold rounded-md uppercase">
                        Swapped
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setExerciseIdToSwap(exercise.id)}
                    className="text-muted hover:text-primary text-sm mt-1 transition-colors"
                  >
                    Swap exercise
                  </button>
                </div>
                <div className="flex gap-2 shrink-0">
                  {/* Note button */}
                  <button
                    onClick={() => updateEntry(exercise.id, { showNote: !entry.showNote })}
                    className={`px-3 py-2 min-h-[48px] min-w-[48px] rounded-lg text-base transition-smooth btn-press ${
                      entry.showNote
                        ? 'glass-primary text-textWhite'
                        : 'glass border-muted/30 hover:border-primary/50 text-muted hover:text-textWhite'
                    }`}
                    title={entry.showNote ? 'Hide note' : 'Add note'}
                  >
                    📝
                  </button>
                  {/* Timer button for time-based exercises - Opens fullscreen */}
                  {displayExercise.unit === 'sec' && (() => {
                    const timerActive = activeTimers.has(exercise.id)
                    const timeRemaining = activeTimers.get(exercise.id)
                    const seconds = entry.reps

                    return (
                      <button
                        onClick={() => openFullscreenTimer(exercise.id, displayExercise.name, seconds)}
                        className={`glass-primary px-4 py-2 min-h-[48px] min-w-[80px] rounded-lg text-base font-bold transition-smooth ${
                          timerActive
                            ? 'shadow-glow-primary animate-timer-pulse'
                            : 'hover:shadow-glow-primary'
                        }`}
                      >
                        {timerActive ? `${timeRemaining}s` : '⏱️'}
                      </button>
                    )
                  })()}
                  <button
                    onClick={() => updateEntry(exercise.id, { completed: !entry.completed })}
                    className={`px-4 py-2 min-h-[48px] min-w-[100px] rounded-lg text-base font-bold transition-smooth btn-press ${
                      entry.completed
                        ? 'glass-primary shadow-glow-primary text-textWhite'
                        : 'glass border-muted/30 hover:border-primary/50 text-muted hover:text-textWhite'
                    }`}
                  >
                    {entry.completed ? '✓ Done' : 'Mark done'}
                  </button>
                </div>
              </div>

              {/* Input fields */}
              {!entry.isAdvancedMode ? (
                // SIMPLE MODE
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-muted text-sm font-medium mb-2">
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
                      className="w-full bg-foundation border-2 border-muted/30 rounded-lg px-4 py-4 text-textWhite text-lg font-medium focus:outline-none focus:border-primary focus:border-2"
                      disabled={exercise.unit === 'sec'}
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm font-medium mb-2">Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={entry.sets}
                      onChange={(e) =>
                        updateEntry(exercise.id, { sets: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-foundation border-2 border-muted/30 rounded-lg px-4 py-4 text-textWhite text-lg font-medium focus:outline-none focus:border-primary focus:border-2"
                    />
                  </div>
                  <div>
                    <label className="block text-muted text-sm font-medium mb-2">
                      {exercise.unit === 'sec' ? 'Seconds' : 'Reps'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={entry.reps}
                      onChange={(e) =>
                        updateEntry(exercise.id, { reps: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-foundation border-2 border-muted/30 rounded-lg px-4 py-4 text-textWhite text-lg font-medium focus:outline-none focus:border-primary focus:border-2"
                    />
                  </div>
                </div>
              ) : (
                // ADVANCED MODE (per-set inputs)
                <div className="space-y-2 mb-3">
                  <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-2 items-center mb-2">
                    <span className="text-xs text-muted font-medium">Set</span>
                    <span className="text-xs text-muted font-medium">Weight (kg)</span>
                    <span className="text-xs text-muted font-medium">Reps</span>
                    <span className="w-10"></span>
                  </div>

                  {entry.setData.map((setEntry, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[auto,1fr,1fr,auto] gap-2 items-center"
                    >
                      <span className="text-textWhite font-bold text-base px-2">
                        {setEntry.set}
                      </span>
                      <input
                        type="number"
                        step="0.25"
                        value={setEntry.weight ?? ''}
                        onChange={(e) =>
                          updateSetData(exercise.id, idx, {
                            weight: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        className="bg-foundation border border-muted/30 rounded px-3 py-3 text-textWhite text-base focus:outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        min="1"
                        value={setEntry.reps}
                        onChange={(e) =>
                          updateSetData(exercise.id, idx, {
                            reps: parseInt(e.target.value) || 1,
                          })
                        }
                        className="bg-foundation border border-muted/30 rounded px-3 py-3 text-textWhite text-base focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => removeSet(exercise.id, idx)}
                        className="w-10 h-10 flex items-center justify-center text-muted hover:text-accent transition-colors"
                        disabled={entry.setData.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSet(exercise.id)}
                    className="w-full bg-surface border border-primary/20 text-primary py-2 rounded text-sm font-medium hover:bg-primary/10 transition-colors"
                  >
                    + Add Set
                  </button>
                </div>
              )}

              {/* Mode toggle button */}
              {exercise.unit !== 'sec' && (
                <button
                  onClick={() => toggleAdvancedMode(exercise.id)}
                  className="text-sm text-muted hover:text-primary mb-2 transition-colors"
                >
                  {entry.isAdvancedMode
                    ? '← Switch to Simple Mode'
                    : 'Switch to Advanced Mode (per-set tracking) →'}
                </button>
              )}

              {/* Note input (shown when note button is active) */}
              {entry.showNote && (
                <div className="mt-3">
                  <label className="block text-muted text-xs mb-1 font-medium">Note</label>
                  <input
                    type="text"
                    value={entry.note}
                    onChange={(e) => updateEntry(exercise.id, { note: e.target.value })}
                    placeholder="Form, feeling, etc."
                    className="w-full glass rounded-lg px-4 py-3 text-textWhite text-base focus:outline-none focus:border-primary focus:shadow-glow-primary transition-smooth"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )
        })}

        {/* Add Exercise Button */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setShowAddExercise(true)}
          className="border-2 border-dashed border-primary/30 hover:border-primary/50"
        >
          <span className="text-xl">+</span>
          Add Exercise
        </Button>
      </div>

      {/* Fixed bottom section */}
      <div className="fixed bottom-0 left-0 right-0 bg-foundation border-t border-primary/20 p-4 space-y-3">
        {/* Rest Timer - Collapsible with Glass Morphism */}
        {showRestTimer ? (
          <div className="glass rounded-lg p-3 animate-slide-down">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textWhite text-sm font-bold">Rest Timer</span>
              <div className="flex items-center gap-2">
                {restTimer !== null && (
                  <button
                    onClick={stopRestTimer}
                    className="glass-primary px-3 py-1 rounded text-xs font-bold transition-smooth hover:shadow-glow-accent"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => setShowRestTimer(false)}
                  className="glass hover:glass-primary px-2 py-1 rounded text-xs font-bold transition-smooth"
                >
                  ✕
                </button>
              </div>
            </div>

            {restTimer !== null ? (
              <div className="text-center animate-scale-in">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 animate-pulse-subtle">
                  {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[30, 60, 90, 120, 180, 240].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => startRestTimer(seconds)}
                    className="glass-primary px-3 py-2 rounded text-sm font-medium transition-smooth hover:shadow-glow-primary btn-press"
                  >
                    {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowRestTimer(true)}
            className="w-full glass-primary py-2 rounded-lg text-sm font-medium transition-smooth hover:shadow-glow-primary flex items-center justify-center gap-2"
          >
            <span className="text-lg">⏱️</span>
            Rest Timer
            {restTimer !== null && (
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold animate-pulse-subtle">
                {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
              </span>
            )}
          </button>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleFinish}
          disabled={isSaving}
          loading={isSaving}
        >
          {!isSaving && 'Finish Workout'}
        </Button>
      </div>

      {/* Exercise Swapper Modal */}
      <ExerciseSwapper
        isOpen={exerciseIdToSwap !== null}
        onClose={() => setExerciseIdToSwap(null)}
        exercises={exercises}
        currentExerciseId={
          exerciseIdToSwap
            ? entries.find((e) => e.exerciseId === exerciseIdToSwap)?.displayExerciseId || ''
            : ''
        }
        onSwap={(newExercise) => {
          if (exerciseIdToSwap) {
            handleSwap(exerciseIdToSwap, newExercise)
          }
        }}
      />

      {/* Add Exercise Modal */}
      <ExerciseSwapper
        isOpen={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        exercises={exercises.filter(ex => !entries.some(e => e.exerciseId === ex.id))}
        currentExerciseId=""
        onSwap={handleAddExercise}
      />

      {/* Fullscreen Immersive Timer */}
      {fullscreenTimerState && (
        <FullscreenTimer
          isOpen={fullscreenTimerState.isOpen}
          seconds={activeTimers.get(fullscreenTimerState.exerciseId) || 0}
          totalSeconds={fullscreenTimerState.totalSeconds}
          exerciseName={fullscreenTimerState.exerciseName}
          onClose={closeFullscreenTimer}
        />
      )}
    </div>
  )
}
