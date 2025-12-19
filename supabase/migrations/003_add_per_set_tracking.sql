-- Migration: Add per-set tracking and exercise swapping
-- This migration is BACKWARD COMPATIBLE - existing data is not modified

-- Add JSONB column for per-set data
-- Structure: [{"set": 1, "weight": 70, "reps": 6}, {"set": 2, "weight": 70, "reps": 6}, ...]
ALTER TABLE session_entries
ADD COLUMN set_data JSONB;

-- Add GIN index for efficient JSONB queries
CREATE INDEX session_entries_set_data_idx ON session_entries USING GIN (set_data);

-- Add column to track if exercise was swapped
-- If NULL, original exercise was used
-- If set, contains the original exercise ID that was swapped
ALTER TABLE session_entries
ADD COLUMN swapped_from_exercise_id UUID REFERENCES exercises(id);

-- Add comments for documentation
COMMENT ON COLUMN session_entries.set_data IS
'Per-set tracking data in format: [{"set": 1, "weight": 70, "reps": 6}, ...]. When NULL, use legacy weight/sets/reps columns.';

COMMENT ON COLUMN session_entries.swapped_from_exercise_id IS
'Original exercise ID if user swapped during workout. NULL if no swap occurred.';

-- NOTE: Existing weight, sets, reps columns remain for backward compatibility
-- When set_data is NULL, the app uses legacy columns
-- When set_data exists, it takes precedence
