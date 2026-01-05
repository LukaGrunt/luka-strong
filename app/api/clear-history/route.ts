import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Delete all session entries first (foreign key constraint)
    const { error: entriesError } = await supabase
      .from('session_entries')
      .delete()
      .eq('user_id', DEFAULT_USER_ID)

    if (entriesError) {
      console.error('Error deleting session entries:', entriesError)
      return NextResponse.json({ error: 'Failed to delete session entries' }, { status: 500 })
    }

    // Then delete all sessions
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .eq('user_id', DEFAULT_USER_ID)

    if (sessionsError) {
      console.error('Error deleting sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to delete sessions' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
