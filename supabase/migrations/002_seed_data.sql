-- Seed data for workout types and exercise templates

-- Insert workout types
INSERT INTO workout_types (id, name, sort_order) VALUES
  ('pull', 'Upper Body Pull', 1),
  ('push', 'Upper Body Push', 2),
  ('lower', 'Lower Body', 3);

-- Upper Body Pull exercises
INSERT INTO exercises (workout_type_id, name, sort_order, is_main, default_weight, default_sets, default_reps) VALUES
  ('pull', 'Lat Pulldown', 1, true, 70, 4, 6),
  ('pull', 'Barbell Row (wide)', 2, true, 40, 4, 8),
  ('pull', 'Straight-Arm Pulldown', 3, false, 20, 4, 10),
  ('pull', 'Face Pull', 4, false, 32, 3, 12),
  ('pull', 'Cable Bar Biceps Curl', 5, false, 40, 4, 8),
  ('pull', 'Incline DB Curl', 6, false, 5, 4, 10),
  ('pull', 'Reverse Preacher Curl', 7, false, 10, 3, 10),
  ('pull', 'Plank', 8, false, NULL, 1, 60);

-- Upper Body Push exercises
INSERT INTO exercises (workout_type_id, name, sort_order, is_main, default_weight, default_sets, default_reps) VALUES
  ('push', 'Bench Press', 1, true, 45, 4, 6),
  ('push', 'Incline DB Press', 2, false, 17.5, 4, 8),
  ('push', 'Chest Fly Machine', 3, false, 35, 3, 10),
  ('push', 'DB Lateral Raise', 4, false, 5, 4, 12),
  ('push', 'Triceps (Cable Extension)', 5, false, 26, 3, 10),
  ('push', 'Plank', 6, false, NULL, 1, 60);

-- Lower Body exercises
INSERT INTO exercises (workout_type_id, name, sort_order, is_main, default_weight, default_sets, default_reps) VALUES
  ('lower', 'Squat', 1, true, 60, 4, 3),
  ('lower', 'Deadlift', 2, true, 65, 4, 4),
  ('lower', 'Leg Press', 3, false, 80, 3, 10),
  ('lower', 'Leg Extension', 4, false, 35, 3, 10),
  ('lower', 'Hip Thrust', 5, false, 40, 3, 12),
  ('lower', 'Standing Calf Raise', 6, false, 30, 3, 12),
  ('lower', 'Plank', 7, false, NULL, 2, 70);

-- Update unit for planks to 'sec'
UPDATE exercises SET unit = 'sec' WHERE name = 'Plank';
