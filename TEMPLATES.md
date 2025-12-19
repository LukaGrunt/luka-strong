# Workout Templates Reference

This document lists all the default exercise templates included in LUKA FORGE.

## Upper Body Pull

| Exercise | Sets | Reps | Weight | Type |
|----------|------|------|--------|------|
| Lat Pulldown | 4 | 6 | 70kg | Main |
| Barbell Row (wide) | 4 | 8 | 40kg | Main |
| Straight-Arm Pulldown | 4 | 10 | 20kg | Accessory |
| Face Pull | 3 | 12 | 32kg | Accessory |
| Cable Bar Biceps Curl | 4 | 8 | 40kg | Accessory |
| Incline DB Curl | 4 | 10 | 5kg | Accessory |
| Reverse Preacher Curl | 3 | 10 | 10kg | Accessory |
| Plank | 1 | 60s | - | Accessory |

## Upper Body Push

| Exercise | Sets | Reps | Weight | Type |
|----------|------|------|--------|------|
| Bench Press | 4 | 6 | 45kg | Main |
| Incline DB Press | 4 | 8 | 17.5kg | Accessory |
| Chest Fly Machine | 3 | 10 | 35kg | Accessory |
| DB Lateral Raise | 4 | 12 | 5kg | Accessory |
| Triceps (Cable Extension) | 3 | 10 | 26kg | Accessory |
| Plank | 1 | 60s | - | Accessory |

## Lower Body

| Exercise | Sets | Reps | Weight | Type |
|----------|------|------|--------|------|
| Squat | 4 | 3 | 60kg | Main |
| Deadlift | 4 | 4 | 65kg | Main |
| Leg Press | 3 | 10 | 80kg | Accessory |
| Leg Extension | 3 | 10 | 35kg | Accessory |
| Hip Thrust | 3 | 12 | 40kg | Accessory |
| Standing Calf Raise | 3 | 12 | 30kg | Accessory |
| Plank | 2 | 70s | - | Accessory |

## Main Lifts vs Accessories

**Main Lifts** have stricter progression rules:
- Must complete target sets/reps with good form to progress
- +2.5kg increment when target achieved
- Repeat same weight if target not met

**Accessories** have more flexible progression:
- Progress when reps exceed target by 2+
- Smaller increments (+1.25kg)
- More forgiving criteria

## Customizing Templates

To customize exercises, edit `supabase/migrations/002_seed_data.sql` and re-run in Supabase SQL Editor.

### Example: Add a New Exercise

```sql
INSERT INTO exercises (
  workout_type_id,
  name,
  sort_order,
  is_main,
  default_weight,
  default_sets,
  default_reps
) VALUES (
  'pull',           -- workout type: 'pull', 'push', or 'lower'
  'Chin-ups',       -- exercise name
  8,                -- sort order (display order)
  false,            -- is_main: true for main lifts, false for accessories
  NULL,             -- default weight (NULL for bodyweight)
  3,                -- default sets
  8                 -- default reps
);
```

### Example: Modify an Exercise

```sql
UPDATE exercises
SET default_weight = 75,
    default_sets = 5
WHERE name = 'Lat Pulldown';
```

### Example: Change Exercise Order

```sql
UPDATE exercises
SET sort_order = 1
WHERE name = 'Barbell Row (wide)';

UPDATE exercises
SET sort_order = 2
WHERE name = 'Lat Pulldown';
```

After making changes, you may need to clear any existing session data to see the updates properly reflected.
