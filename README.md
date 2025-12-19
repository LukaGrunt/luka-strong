# LUKA FORGE

A production-ready PWA workout logger with Strava integration, built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Fast workout logging** for 3 workout types: Upper Pull, Upper Push, Lower Body
- **Template-based logging** with automatic prefill from previous workouts
- **Strava copy generator** - one-click copy of workout summary
- **Deterministic progression suggestions** for main lifts and accessories
- **Offline-first** - queue writes and sync when back online
- **PWA support** - installable on mobile devices
- **Dark, tactical UI** with high contrast and minimal design

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for PostgreSQL database (auth disabled for now)
- **localforage** for offline storage
- **Service Worker** for offline caching

## Project Structure

```
luka-strong/
├── app/                        # Next.js app directory
│   ├── workout/               # Workout picker and session pages
│   │   ├── [id]/             # Active session logger
│   │   │   └── finish/       # Finish screen with Strava copy
│   │   └── page.tsx          # Workout picker
│   ├── history/              # Workout history
│   │   ├── [id]/            # Individual session detail
│   │   └── page.tsx         # All sessions list
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (redirects to /workout)
├── components/               # React components
│   ├── WorkoutPicker.tsx
│   ├── SessionLogger.tsx
│   ├── FinishScreen.tsx
│   └── HistoryDetail.tsx
├── lib/                      # Utilities and helpers
│   ├── supabase.ts          # Supabase client
│   ├── database.types.ts    # TypeScript types
│   ├── progression.ts       # Progression calculation logic
│   ├── strava.ts           # Strava formatter
│   ├── offline-queue.ts    # Offline sync queue
│   └── session-storage.ts  # Local session storage
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── icon-*.png          # App icons
└── supabase/
    └── migrations/          # Database migrations and seed
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone and Install

```bash
cd Luka-strong
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Migrations

In your Supabase SQL Editor, run the following migrations in order:

1. **Initial Schema** - Run `supabase/migrations/001_initial_schema.sql`
2. **Seed Data** - Run `supabase/migrations/002_seed_data.sql`

This will create:
- `workout_types` table with 3 workout types
- `exercises` table with template exercises
- `sessions` table for workout sessions
- `session_entries` table for logged exercises
- Proper indexes and RLS policies

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

### Tables

**workout_types**
- `id` (text) - Primary key: 'pull', 'push', 'lower'
- `name` (text) - Display name
- `sort_order` (integer) - Order for display

**exercises**
- `id` (uuid) - Primary key
- `workout_type_id` (text) - Foreign key
- `name` (text) - Exercise name
- `sort_order` (integer) - Order within workout
- `is_main` (boolean) - Main lift vs accessory
- `unit` (text) - 'kg' or 'sec'
- `default_weight` (numeric) - Template weight
- `default_sets` (integer) - Template sets
- `default_reps` (integer) - Template reps

**sessions**
- `id` (uuid) - Primary key
- `user_id` (uuid) - User reference (default for now)
- `workout_type_id` (text) - Foreign key
- `started_at` (timestamptz) - Session start time
- `finished_at` (timestamptz) - Session end time

**session_entries**
- `id` (uuid) - Primary key
- `session_id` (uuid) - Foreign key
- `user_id` (uuid) - User reference
- `exercise_id` (uuid) - Foreign key
- `weight` (numeric) - Logged weight
- `sets` (integer) - Logged sets
- `reps` (integer) - Logged reps
- `note` (text) - Optional note
- `completed` (boolean) - Whether exercise was completed
- `created_at` (timestamptz) - Entry timestamp

## Progression Logic

### Main Lifts (Bench, Squat, Deadlift, Lat Pulldown, Barbell Row)

- **Target met** (sets/reps ≥ template, completed, no form issues): +2.5kg
- **Target not met**: Repeat same weight
- **Pain detected**: Reduce 10%, show warning

### Accessories

- **Exceeded reps** (≥ template + 2) or marked "easy": +1.25kg
- **Otherwise**: Repeat same weight

Pain/form keywords: `pain`, `hurt`, `injury`, `bad form`, `cheat`, `ego`, `failed`

## Offline Support

The app works offline using:

1. **Service Worker** - Caches app shell and routes
2. **localforage** - Stores session data locally
3. **Mutation Queue** - Queues writes when offline, syncs when online

When offline:
- ✓ Start new sessions
- ✓ Log exercises
- ✓ View history
- ✗ Initial data load (requires connection once)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Environment Variables

Required for production:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## Customization

### Workout Templates

Edit `supabase/migrations/002_seed_data.sql` to customize:
- Exercise selection
- Default weights, sets, reps
- Exercise order
- Main vs accessory classification

### Color Palette

Edit `tailwind.config.ts`:

```ts
colors: {
  primary: '#F97316',    // Orange
  foundation: '#0A0A0A', // Black
  accent: '#B91C1C',     // Red (warnings)
  surface: '#27272A',    // Dark Grey
  muted: '#71717A',      // Muted Grey
  textWhite: '#FAFAFA',  // White
}
```

### Progression Rules

Edit `lib/progression.ts` to adjust:
- Weight increments
- Target achievement criteria
- Keyword detection

## PWA Installation

### iOS

1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

### Android

1. Open in Chrome
2. Tap menu (3 dots)
3. Tap "Install app" or "Add to Home Screen"

## Icons

Replace placeholder icons in `/public/`:
- `icon-192.png` - 192x192px PNG
- `icon-512.png` - 512x512px PNG
- Use the orange (#F97316) on black (#0A0A0A) color scheme

## Future Enhancements (Not Implemented)

- Email magic link authentication
- Multi-user support with RLS
- Exercise swap/customization UI
- Microloading toggle
- Charts and analytics
- Exercise video links

## License

MIT

## Support

For issues and feature requests, please use GitHub Issues.
