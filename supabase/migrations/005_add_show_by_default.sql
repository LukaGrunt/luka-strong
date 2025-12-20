-- Add show_by_default column to control which exercises appear automatically
ALTER TABLE exercises ADD COLUMN show_by_default BOOLEAN DEFAULT true;

-- Mark original core exercises (sort_order 1-8) as showing by default
UPDATE exercises SET show_by_default = true WHERE sort_order <= 8;

-- Hide newly added exercises (sort_order 9+) by default
-- Users can manually add these via "+ Add Exercise" button
UPDATE exercises SET show_by_default = false WHERE sort_order >= 9;

-- Add comment
COMMENT ON COLUMN exercises.show_by_default IS
'Whether this exercise appears in workouts by default. False means it only shows when manually added via + button.';
