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

  // Lowercase workout type name
  let output = workoutTypeName.toLowerCase() + '\n\n'

  const completedEntries = entries.filter(e => e.completed)

  for (const entry of completedEntries) {
    if (!entry.exercise) continue

    const exercise = entry.exercise
    // Lowercase exercise name
    const name = exercise.name.toLowerCase()

    if (exercise.unit === 'sec') {
      // Time-based exercise (plank) - format: "plank 3×45s"
      output += `${name} ${entry.sets}×${entry.reps}s`
    } else {
      // Weight-based exercise
      const weight = entry.weight !== null ? entry.weight : 0

      // Check if per-set data exists (new format)
      if ((entry as any).set_data && Array.isArray((entry as any).set_data)) {
        const setData = (entry as any).set_data

        // Group consecutive sets with same weight
        const groups: Array<{ weight: number | null; reps: number[]; count: number }> = []

        for (const set of setData) {
          const lastGroup = groups[groups.length - 1]
          const sameWeight = lastGroup && lastGroup.weight === set.weight
          const sameReps = sameWeight && lastGroup.reps.every(r => r === set.reps)

          if (sameReps) {
            // Same weight and reps, increment count
            lastGroup.count++
          } else {
            // New group
            groups.push({
              weight: set.weight,
              reps: [set.reps],
              count: 1
            })
          }
        }

        // Format: "bench 70kg 2×6, 60kg 2×8 reps"
        const groupStrings = groups.map(g => {
          const w = g.weight ?? 0
          const avgReps = Math.round(g.reps.reduce((a, b) => a + b, 0) / g.reps.length)
          return `${w}kg ${g.count}×${avgReps}`
        })

        output += `${name} ${groupStrings.join(', ')} reps`
      } else {
        // Simple mode (legacy format) - format: "bench 60kg 4×6 reps"
        output += `${name} ${weight}kg ${entry.sets}×${entry.reps} reps`
      }
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
