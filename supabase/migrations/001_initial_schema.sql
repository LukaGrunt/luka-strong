-- Initial schema for Luka Strong workout logger
-- Auth is disabled for now, using default user_id

-- Workout types table (push, pull, lower)
CREATE TABLE workout_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

-- Exercises table with templates
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_type_id TEXT NOT NULL REFERENCES workout_types(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_main BOOLEAN DEFAULT false,
  unit TEXT DEFAULT 'kg',
  default_weight NUMERIC,
  default_sets INTEGER NOT NULL,
  default_reps INTEGER NOT NULL
);

-- Workout sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  workout_type_id TEXT NOT NULL REFERENCES workout_types(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- Session entries (logged exercises)
CREATE TABLE session_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  weight NUMERIC,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  note TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX sessions_user_started_idx ON sessions(user_id, started_at DESC);
CREATE INDEX session_entries_user_exercise_idx ON session_entries(user_id, exercise_id, created_at DESC);
CREATE INDEX session_entries_session_idx ON session_entries(session_id);

-- Enable Row Level Security (RLS) - currently permissive since no auth
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_entries ENABLE ROW LEVEL SECURITY;

-- Permissive policies for now (no auth)
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all for session_entries" ON session_entries FOR ALL USING (true);

-- Make workout_types and exercises readable by all
CREATE POLICY "Allow read for workout_types" ON workout_types FOR SELECT USING (true);
CREATE POLICY "Allow read for exercises" ON exercises FOR SELECT USING (true);
ALTER TABLE workout_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
