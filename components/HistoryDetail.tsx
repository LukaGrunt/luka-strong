'use client'

import { useState } from 'react'
import Link from 'next/link'
import { copyToClipboard } from '@/lib/strava'
import type { Database } from '@/lib/database.types'

type SessionEntry = Database['public']['Tables']['session_entries']['Row'] & {
  exercise?: Database['public']['Tables']['exercises']['Row']
}

type Session = Database['public']['Tables']['sessions']['Row'] & {
  workout_types?: { name: string } | null
}

interface Props {
  session: Session
  entries: SessionEntry[]
  stravaText: string
}

export default function HistoryDetail({ session, entries, stravaText }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(stravaText)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const finishedDate = session.finished_at ? new Date(session.finished_at) : null
  const completedEntries = entries.filter((e) => e.completed)

  return (
    <div className="min-h-screen bg-foundation p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-textWhite mb-2">
            {session.workout_types?.name || 'Workout'}
          </h1>
          {finishedDate && (
            <p className="text-muted">
              {finishedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' • '}
              {finishedDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </header>

        {/* Exercises performed */}
        <div className="glass rounded-lg p-6 mb-6 animate-scale-in shadow-glass">
          <h2 className="text-lg font-bold text-textWhite mb-4">Exercises</h2>
          <div className="space-y-4">
            {completedEntries.map((entry) => {
              if (!entry.exercise) return null

              return (
                <div key={entry.id} className="border-b border-muted/20 last:border-0 pb-3 last:pb-0">
                  <h3 className="font-medium text-textWhite mb-2">{entry.exercise.name}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted">
                        {entry.exercise.unit === 'sec' ? 'Time' : 'Weight'}
                      </span>
                      <p className="text-textWhite font-medium">
                        {entry.weight !== null
                          ? `${entry.weight}${entry.exercise.unit}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Sets</span>
                      <p className="text-textWhite font-medium">{entry.sets}</p>
                    </div>
                    <div>
                      <span className="text-muted">
                        {entry.exercise.unit === 'sec' ? 'Seconds' : 'Reps'}
                      </span>
                      <p className="text-textWhite font-medium">{entry.reps}</p>
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-muted text-sm mt-2 italic">{entry.note}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Strava Copy */}
        <div className="glass rounded-lg p-6 mb-6 animate-scale-in shadow-glass" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-bold text-textWhite mb-4">Strava Copy</h2>
          <div className="bg-foundation/50 rounded p-4 mb-4 font-mono text-sm text-textWhite whitespace-pre-wrap border border-muted/20 backdrop-blur-sm">
            {stravaText}
          </div>
          <button
            onClick={handleCopy}
            className="w-full glass-primary py-3 min-h-[48px] rounded-lg font-bold text-textWhite transition-smooth hover:shadow-glow-primary btn-press shadow-glass-inset"
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <Link
            href="/history"
            className="block w-full glass py-3 min-h-[48px] rounded-lg text-textWhite text-center font-medium transition-smooth hover:shadow-glow-primary btn-press flex items-center justify-center"
          >
            Back to History
          </Link>
          <Link
            href="/workout"
            className="block w-full text-center text-primary hover:text-primary/80 py-2 transition-smooth"
          >
            Start New Workout
          </Link>
        </div>
      </div>
    </div>
  )
}
