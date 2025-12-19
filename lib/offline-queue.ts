import localforage from 'localforage'

interface QueuedMutation {
  id: string
  type: 'insert' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
}

const QUEUE_KEY = 'offline_mutation_queue'

// Initialize localforage
const storage = localforage.createInstance({
  name: 'luka-strong',
  storeName: 'offline_queue',
})

export async function queueMutation(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>) {
  const queue = await getQueue()
  const newMutation: QueuedMutation = {
    ...mutation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  queue.push(newMutation)
  await storage.setItem(QUEUE_KEY, queue)
  return newMutation
}

export async function getQueue(): Promise<QueuedMutation[]> {
  const queue = await storage.getItem<QueuedMutation[]>(QUEUE_KEY)
  return queue || []
}

export async function clearQueue() {
  await storage.setItem(QUEUE_KEY, [])
}

export async function removeFromQueue(mutationId: string) {
  const queue = await getQueue()
  const filtered = queue.filter(m => m.id !== mutationId)
  await storage.setItem(QUEUE_KEY, filtered)
}

export function isOnline(): boolean {
  return navigator.onLine
}

export async function processQueue(supabase: any): Promise<{ success: number; failed: number }> {
  if (!isOnline()) {
    return { success: 0, failed: 0 }
  }

  const queue = await getQueue()
  let success = 0
  let failed = 0

  for (const mutation of queue) {
    try {
      switch (mutation.type) {
        case 'insert':
          await supabase.from(mutation.table).insert(mutation.data)
          break
        case 'update':
          await supabase.from(mutation.table).update(mutation.data).eq('id', mutation.data.id)
          break
        case 'delete':
          await supabase.from(mutation.table).delete().eq('id', mutation.data.id)
          break
      }
      await removeFromQueue(mutation.id)
      success++
    } catch (error) {
      console.error('Failed to process mutation:', mutation, error)
      failed++
    }
  }

  return { success, failed }
}
