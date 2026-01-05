'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearHistoryButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleClear = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/clear-history', {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
        setShowConfirm(false)
      } else {
        console.error('Failed to clear history')
      }
    } catch (error) {
      console.error('Error clearing history:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-foundation/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="glass rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-xl font-bold text-textWhite mb-2">Clear All History?</h3>
          <p className="text-muted mb-6">
            This will permanently delete all your workout history. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 glass rounded-lg px-4 py-3 text-textWhite hover:border-primary/50 transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              disabled={isDeleting}
              className="flex-1 bg-accent rounded-lg px-4 py-3 text-textWhite font-medium hover:opacity-90 transition-smooth"
            >
              {isDeleting ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-accent hover:text-accent/80 text-sm font-medium transition-smooth"
    >
      Clear History
    </button>
  )
}
