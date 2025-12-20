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
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customWeight, setCustomWeight] = useState<number>(20)
  const [customSets, setCustomSets] = useState<number>(3)
  const [customReps, setCustomReps] = useState<number>(10)
  const [customIsTimer, setCustomIsTimer] = useState<boolean>(false)

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

  const handleCustomSubmit = () => {
    if (!customName.trim()) return

    // Create a custom exercise object
    const customExercise: Exercise = {
      id: `custom-${Date.now()}-${customName.toLowerCase().replace(/\s+/g, '-')}`,
      workout_type_id: exercises[0]?.workout_type_id || '',
      name: customName,
      sort_order: 999,
      is_main: false,
      unit: customIsTimer ? 'sec' : 'kg',
      default_weight: customIsTimer ? null : customWeight,
      default_sets: customSets,
      default_reps: customReps,
      show_by_default: false,
    }

    onSwap(customExercise)
    setSearchQuery('')
    setShowCustomForm(false)
    setCustomName('')
    setCustomWeight(20)
    setCustomSets(3)
    setCustomReps(10)
    setCustomIsTimer(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-fade-in">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-foundation/90 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal with glass morphism */}
      <div className="relative w-full max-w-lg glass-strong rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col animate-slide-up shadow-glass">
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

          {/* Search with glass styling */}
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 glass rounded-lg text-textWhite text-lg placeholder:text-muted focus:outline-none focus:border-primary focus:shadow-glow-primary transition-smooth"
          />
        </div>

        {/* Exercise List or Custom Form */}
        <div className="flex-1 overflow-y-auto p-4">
          {showCustomForm ? (
            // Custom Exercise Form
            <div className="space-y-4">
              <div>
                <label className="block text-textWhite text-sm font-medium mb-2">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g., Cable Crossover or Plank"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-lg text-textWhite text-lg focus:outline-none focus:border-primary focus:shadow-glow-primary transition-smooth"
                  autoFocus
                />
              </div>

              {/* Timer Toggle */}
              <div className="flex items-center justify-between glass rounded-lg p-3">
                <span className="text-textWhite text-sm font-medium">Timer-based exercise (e.g., Plank)</span>
                <button
                  type="button"
                  onClick={() => setCustomIsTimer(!customIsTimer)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-smooth ${
                    customIsTimer ? 'bg-primary' : 'glass border border-muted/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-textWhite transition-transform ${
                      customIsTimer ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className={`grid ${customIsTimer ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                {!customIsTimer && (
                  <div>
                    <label className="block text-textWhite text-sm font-medium mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={customWeight}
                      onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 glass rounded-lg text-textWhite text-lg focus:outline-none focus:border-primary focus:shadow-glow-primary transition-smooth"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-textWhite text-sm font-medium mb-2">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={customSets}
                    onChange={(e) => setCustomSets(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 glass rounded-lg text-textWhite text-lg focus:outline-none focus:border-primary focus:shadow-glow-primary transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-textWhite text-sm font-medium mb-2">
                    {customIsTimer ? 'Seconds' : 'Reps'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customReps}
                    onChange={(e) => setCustomReps(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 glass rounded-lg text-textWhite text-lg focus:outline-none focus:border-primary focus:shadow-glow-primary transition-smooth"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 px-4 py-3 glass rounded-lg font-medium text-textWhite hover:shadow-glow-primary transition-smooth btn-press"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customName.trim()}
                  className="flex-1 px-4 py-3 glass-primary rounded-lg font-bold text-textWhite hover:shadow-glow-primary transition-smooth disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                >
                  Add Exercise
                </button>
              </div>
            </div>
          ) : (
            // Exercise List
            <>
              {availableExercises.length === 0 ? (
                <p className="text-muted text-center py-8">No exercises found</p>
              ) : (
                <div className="space-y-2">
                  {availableExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleSelect(exercise)}
                      className="w-full p-4 glass rounded-lg glass-hover text-left group"
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

              {/* Add Custom Exercise Button */}
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full mt-4 p-4 glass border-2 border-dashed border-primary/30 hover:border-primary/50 hover:shadow-glow-primary text-primary rounded-lg font-medium transition-smooth flex items-center justify-center gap-2 btn-press"
              >
                <span className="text-xl">+</span>
                Add Custom Exercise
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
