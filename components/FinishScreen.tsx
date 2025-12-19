'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { copyToClipboard } from '@/lib/strava'
import Link from 'next/link'

interface Progression {
  exerciseName: string
  currentWeight: number | null
  suggestedWeight: number | null
  reason: string
  isWarning: boolean
}

interface Session {
  id: string
  started_at: string
  finished_at: string | null
  workout_types?: { name: string } | null
}

interface Props {
  session: Session
  stravaText: string
  progressions: Progression[]
}

export default function FinishScreen({ session, stravaText, progressions }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(stravaText)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-foundation p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-textWhite mb-2">Workout Complete!</h1>
          <p className="text-muted">
            {session.workout_types?.name || 'Workout'} •{' '}
            {new Date(session.started_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </header>

        {/* Strava Copy Section */}
        <div className="bg-surface border border-primary/20 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-textWhite mb-4">Strava Copy</h2>

          <div className="bg-foundation rounded p-4 mb-4 font-mono text-sm text-textWhite whitespace-pre-wrap border border-muted/20">
            {stravaText}
          </div>

          <button
            onClick={handleCopy}
            className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-foundation font-bold py-3 rounded-lg transition-colors mb-2"
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>

          {/* Include notes toggle - future feature
          <label className="flex items-center text-muted text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="mr-2"
            />
            Include notes in copy
          </label>
          */}
        </div>

        {/* Next Time Targets */}
        {progressions.length > 0 && (
          <div className="bg-surface border border-primary/20 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-textWhite mb-4">Next Time Targets</h2>
            <div className="space-y-3">
              {progressions.map((prog, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    prog.isWarning
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-foundation border-muted/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-textWhite">{prog.exerciseName}</span>
                    {prog.suggestedWeight !== null && (
                      <span className={`font-bold ${prog.isWarning ? 'text-accent' : 'text-primary'}`}>
                        {prog.currentWeight}kg → {prog.suggestedWeight}kg
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${prog.isWarning ? 'text-accent' : 'text-muted'}`}>
                    {prog.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/workout"
            className="block w-full bg-surface hover:bg-surface/80 border-2 border-primary/20 text-textWhite text-center font-bold py-3 rounded-lg transition-colors"
          >
            Start New Workout
          </Link>
          <Link
            href={`/history/${session.id}`}
            className="block w-full text-center text-primary hover:text-primary/80 py-2"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  )
}
