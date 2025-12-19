import localforage from 'localforage'
import type { Database } from './database.types'

type SessionEntry = Database['public']['Tables']['session_entries']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

const storage = localforage.createInstance({
  name: 'luka-strong',
  storeName: 'sessions',
})

export async function saveSessionLocally(session: Session) {
  await storage.setItem(`session_${session.id}`, session)
}

export async function getSessionLocally(sessionId: string): Promise<Session | null> {
  return await storage.getItem(`session_${sessionId}`)
}

export async function saveEntriesLocally(sessionId: string, entries: SessionEntry[]) {
  await storage.setItem(`entries_${sessionId}`, entries)
}

export async function getEntriesLocally(sessionId: string): Promise<SessionEntry[]> {
  const entries = await storage.getItem<SessionEntry[]>(`entries_${sessionId}`)
  return entries || []
}

export async function clearSessionLocally(sessionId: string) {
  await storage.removeItem(`session_${sessionId}`)
  await storage.removeItem(`entries_${sessionId}`)
}
