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

export function calculateProgression(
  exercise: Exercise,
  entry: SessionEntry,
  microloading: boolean = false
): ProgressionSuggestion {
  const increment = microloading ? 1.25 : 2.5
  const isMain = exercise.is_main
  const note = (entry.note || '').toLowerCase()

  // Check for pain
  const hasPain = PAIN_KEYWORDS.some(keyword => note.includes(keyword))
  if (hasPain) {
    const reduction = entry.weight ? entry.weight * 0.9 : null
    return {
      exerciseName: exercise.name,
      currentWeight: entry.weight,
      suggestedWeight: reduction ? Math.round(reduction * 4) / 4 : null,
      reason: 'Pain detected - reduce weight 10% and fix technique',
      isWarning: true,
    }
  }

  // Check for form issues
  const hasFormIssue = FORM_ISSUE_KEYWORDS.some(keyword => note.includes(keyword))

  if (isMain) {
    // Main lift progression
    const metTarget = entry.completed &&
                     entry.sets >= exercise.default_sets &&
                     entry.reps >= exercise.default_reps &&
                     !hasFormIssue

    if (metTarget) {
      const suggested = entry.weight ? entry.weight + increment : null
      return {
        exerciseName: exercise.name,
        currentWeight: entry.weight,
        suggestedWeight: suggested,
        reason: `Target achieved - add ${increment}kg`,
        isWarning: false,
      }
    } else {
      return {
        exerciseName: exercise.name,
        currentWeight: entry.weight,
        suggestedWeight: entry.weight,
        reason: 'Repeat same weight',
        isWarning: false,
      }
    }
  } else {
    // Accessory progression
    const exceededReps = entry.reps >= exercise.default_reps + 2
    const markedEasy = note.includes('easy')

    if (exceededReps || markedEasy) {
      const suggested = entry.weight ? entry.weight + (increment / 2) : null
      return {
        exerciseName: exercise.name,
        currentWeight: entry.weight,
        suggestedWeight: suggested,
        reason: `Strong performance - add ${increment / 2}kg`,
        isWarning: false,
      }
    } else {
      return {
        exerciseName: exercise.name,
        currentWeight: entry.weight,
        suggestedWeight: entry.weight,
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
