export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Per-set tracking data structure
export interface SetData {
  set: number
  weight: number | null
  reps: number
}

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
          show_by_default: boolean
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
          show_by_default?: boolean
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
          show_by_default?: boolean
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
          set_data: SetData[] | null
          swapped_from_exercise_id: string | null
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
          set_data?: SetData[] | null
          swapped_from_exercise_id?: string | null
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
          set_data?: SetData[] | null
          swapped_from_exercise_id?: string | null
        }
      }
    }
  }
}
