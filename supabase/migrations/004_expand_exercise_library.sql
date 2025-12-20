-- Expand exercise library with common gym exercises
-- Adds ~18 new exercises across all workout types

-- Add new Upper Body Pull exercises
INSERT INTO exercises (workout_type_id, name, sort_order, is_main, default_weight, default_sets, default_reps) VALUES
  ('pull', 'Barbell Bent-Over Row', 9, true, 40, 4, 8),
  ('pull', 'Dumbbell Single-Arm Row', 10, false, 15, 4, 10),
  ('pull', 'Pull-Up', 11, true, NULL, 3, 8),
  ('pull', 'Hammer Curl', 12, false, 10, 3, 12),
  ('pull', 'Seated Cable Row', 13, false, 50, 4, 10);

-- Add new Upper Body Push exercises
INSERT INTO exercises (workout_type_id, name, sort_order, is_main, default_weight, default_sets, default_reps) VALUES
  ('push', 'Overhead Press', 7, true, 30, 4, 8),
  ('push', 'Dumbbell Shoulder Press', 8, false, 12.5, 4, 10),
  ('push', 'Incline Bench Press', 9, true, 40, 4, 8),
  ('push', 'Dip', 10, false, NULL, 3, 8),
  ('push', 'Cable Fly', 11, false, 20, 3, 12),
  ('push', 'Rear Delt Fly', 12, false, 25, 3, 15),
  ('push', 'Skull Crusher', 13, false, 20, 3, 10);

-- Add new Lower Body exercises
INSERT INTO exercises (workout_type_id, name, sort_order, is_main, default_weight, default_sets, default_reps) VALUES
  ('lower', 'Front Squat', 8, true, 50, 4, 6),
  ('lower', 'Romanian Deadlift', 9, true, 50, 4, 8),
  ('lower', 'Bulgarian Split Squat', 10, false, 12.5, 3, 10),
  ('lower', 'Goblet Squat', 11, false, 20, 3, 12),
  ('lower', 'Walking Lunge', 12, false, 10, 3, 12),
  ('lower', 'Hamstring Curl', 13, false, 30, 3, 12);
