import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getAllSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      workout_types (
        name
      )
    `)
    .eq('user_id', DEFAULT_USER_ID)
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data
}

export default async function HistoryPage() {
  const sessions = await getAllSessions()

  return (
    <div className="min-h-screen bg-foundation p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-textWhite tracking-tight">LUKA FORGE</h1>
        <p className="text-muted mt-1">Workout History</p>
      </header>

      <div className="max-w-2xl mx-auto">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No workouts logged yet</p>
            <Link
              href="/workout"
              className="inline-block mt-4 text-primary hover:text-primary/80"
            >
              Start your first workout →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const finishedDate = session.finished_at
                ? new Date(session.finished_at)
                : null

              return (
                <Link
                  key={session.id}
                  href={`/history/${session.id}`}
                  className="block bg-surface hover:bg-surface/80 border border-primary/10 rounded-lg p-4 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-textWhite mb-1">
                        {session.workout_types?.name || 'Unknown'}
                      </h3>
                      {finishedDate && (
                        <p className="text-muted text-sm">
                          {finishedDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
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
                    </div>
                    <span className="text-primary">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <Link
          href="/workout"
          className="block text-center text-primary hover:text-primary/80 mt-8 font-medium"
        >
          ← Back to workouts
        </Link>
      </div>
    </div>
  )
}
