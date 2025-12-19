export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workout_types: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          sort_order: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
      }
      exercises: {
        Row: {
          id: string
          workout_type_id: string
          name: string
          sort_order: number
          is_main: boolean
          unit: string
          default_weight: number | null
          default_sets: number
          default_reps: number
        }
        Insert: {
          id?: string
          workout_type_id: string
          name: string
          sort_order: number
          is_main?: boolean
          unit?: string
          default_weight?: number | null
          default_sets: number
          default_reps: number
        }
        Update: {
          id?: string
          workout_type_id?: string
          name?: string
          sort_order?: number
          is_main?: boolean
          unit?: string
          default_weight?: number | null
          default_sets?: number
          default_reps?: number
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          workout_type_id: string
          started_at: string
          finished_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          workout_type_id: string
          started_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_type_id?: string
          started_at?: string
          finished_at?: string | null
        }
      }
      session_entries: {
        Row: {
          id: string
          session_id: string
          user_id: string
          exercise_id: string
          weight: number | null
          sets: number
          reps: number
          note: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string
          exercise_id: string
          weight?: number | null
          sets: number
          reps: number
          note?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          exercise_id?: string
          weight?: number | null
          sets?: number
          reps?: number
          note?: string | null
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}
