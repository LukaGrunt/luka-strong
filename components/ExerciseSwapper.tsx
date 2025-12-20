'use client'

import { useState } from 'react'
import type { Database } from '@/lib/database.types'

type Exercise = Database['public']['Tables']['exercises']['Row']

interface ExerciseSwapperProps {
  isOpen: boolean
  onClose: () => void
  exercises: Exercise[]
  currentExerciseId: string
  onSwap: (newExercise: Exercise) => void
}

export default function ExerciseSwapper({
  isOpen,
  onClose,
  exercises,
  currentExerciseId,
  onSwap,
}: ExerciseSwapperProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  // Filter out current exercise and apply search
  const availableExercises = exercises
    .filter(ex => ex.id !== currentExerciseId)
    .filter(ex =>
      searchQuery === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleSelect = (exercise: Exercise) => {
    onSwap(exercise)
    setSearchQuery('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-textWhite">Swap Exercise</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-textWhite transition-colors p-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-foundation border-2 border-muted/30 rounded-lg text-textWhite text-lg placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4">
          {availableExercises.length === 0 ? (
            <p className="text-muted text-center py-8">No exercises found</p>
          ) : (
            <div className="space-y-2">
              {availableExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelect(exercise)}
                  className="w-full p-4 bg-foundation rounded-lg border-2 border-muted/30 hover:border-primary transition-colors text-left group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-textWhite group-hover:text-primary transition-colors">
                      {exercise.name}
                    </h3>
                    {exercise.is_main && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-md uppercase shrink-0">
                        Main
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted">
                    {exercise.default_weight !== null && (
                      <span>
                        {exercise.default_weight}{exercise.unit}
                      </span>
                    )}
                    <span>{exercise.default_sets} sets</span>
                    <span>{exercise.default_reps} {exercise.unit === 'sec' ? 'sec' : 'reps'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
