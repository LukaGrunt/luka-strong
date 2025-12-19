import type { Database } from './database.types'

type Exercise = Database['public']['Tables']['exercises']['Row']
type SessionEntry = Database['public']['Tables']['session_entries']['Row'] & {
  exercise?: Exercise
}

interface StravaFormatOptions {
  includeNotes?: boolean
}

export function formatForStrava(
  workoutTypeName: string,
  entries: SessionEntry[],
  options: StravaFormatOptions = {}
): string {
  const { includeNotes = false } = options

  let output = workoutTypeName + '\n\n'

  const completedEntries = entries.filter(e => e.completed)

  for (const entry of completedEntries) {
    if (!entry.exercise) continue

    const exercise = entry.exercise
    const name = exercise.name

    if (exercise.unit === 'sec') {
      // Time-based exercise (plank)
      output += `${name}: ${entry.sets}x${entry.reps}s`
    } else {
      // Weight-based exercise
      const weight = entry.weight !== null ? entry.weight : 0
      output += `${name}: ${weight}kg ${entry.sets}x${entry.reps}`
    }

    if (includeNotes && entry.note) {
      output += ` (${entry.note})`
    }

    output += '\n'
  }

  return output.trim()
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}
