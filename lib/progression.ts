import type { Database } from './database.types'

type Exercise = Database['public']['Tables']['exercises']['Row']
type SessionEntry = Database['public']['Tables']['session_entries']['Row']

interface ProgressionSuggestion {
  exerciseName: string
  currentWeight: number | null
  suggestedWeight: number | null
  reason: string
  isWarning: boolean
}

const PAIN_KEYWORDS = ['pain', 'hurt', 'injury', 'sore']
const FORM_ISSUE_KEYWORDS = ['bad form', 'cheat', 'ego', 'failed']

// Extract weight and reps from either per-set data or legacy fields
function extractWorkData(entry: SessionEntry): { weight: number | null; reps: number } {
  if (entry.set_data && entry.set_data.length > 0) {
    // Use last set weight (typically most representative for progression)
    const lastSet = entry.set_data[entry.set_data.length - 1]
    const avgReps = Math.round(
      entry.set_data.reduce((sum, s) => sum + s.reps, 0) / entry.set_data.length
    )
    return {
      weight: lastSet.weight,
      reps: avgReps,
    }
  }
  // Fallback to legacy fields
  return {
    weight: entry.weight,
    reps: entry.reps,
  }
}

export function calculateProgression(
  exercise: Exercise,
  entry: SessionEntry,
  microloading: boolean = false
): ProgressionSuggestion {
  const increment = microloading ? 1.25 : 2.5
  const isMain = exercise.is_main
  const note = (entry.note || '').toLowerCase()

  // Extract weight and reps (handles both per-set and legacy data)
  const { weight: currentWeight, reps: currentReps } = extractWorkData(entry)

  // Check for pain
  const hasPain = PAIN_KEYWORDS.some(keyword => note.includes(keyword))
  if (hasPain) {
    const reduction = currentWeight ? currentWeight * 0.9 : null
    return {
      exerciseName: exercise.name,
      currentWeight,
      suggestedWeight: reduction ? Math.round(reduction * 4) / 4 : null,
      reason: 'Pain detected - reduce weight 10% and fix technique',
      isWarning: true,
    }
  }

  // Check for form issues
  const hasFormIssue = FORM_ISSUE_KEYWORDS.some(keyword => note.includes(keyword))

  if (isMain) {
    // Main lift progression
    const setsCompleted = entry.set_data ? entry.set_data.length : entry.sets
    const metTarget = entry.completed &&
                     setsCompleted >= exercise.default_sets &&
                     currentReps >= exercise.default_reps &&
                     !hasFormIssue

    if (metTarget) {
      const suggested = currentWeight ? currentWeight + increment : null
      return {
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: suggested,
        reason: `Target achieved - add ${increment}kg`,
        isWarning: false,
      }
    } else {
      return {
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: currentWeight,
        reason: 'Repeat same weight',
        isWarning: false,
      }
    }
  } else {
    // Accessory progression
    const exceededReps = currentReps >= exercise.default_reps + 2
    const markedEasy = note.includes('easy')

    if (exceededReps || markedEasy) {
      const suggested = currentWeight ? currentWeight + (increment / 2) : null
      return {
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: suggested,
        reason: `Strong performance - add ${increment / 2}kg`,
        isWarning: false,
      }
    } else {
      return {
        exerciseName: exercise.name,
        currentWeight,
        suggestedWeight: currentWeight,
        reason: 'Repeat same weight',
        isWarning: false,
      }
    }
  }
}

export function calculateAllProgressions(
  exercises: Exercise[],
  entries: SessionEntry[],
  microloading: boolean = false
): ProgressionSuggestion[] {
  return entries
    .filter(entry => entry.completed)
    .map(entry => {
      const exercise = exercises.find(ex => ex.id === entry.exercise_id)
      if (!exercise) return null
      return calculateProgression(exercise, entry, microloading)
    })
    .filter((s): s is ProgressionSuggestion => s !== null)
}
