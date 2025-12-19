# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create

## Step 3: Configure Environment Variables

1. In your Supabase project, go to **Project Settings → API**
2. Copy the **Project URL** and **anon public** key
3. Open `.env.local` in this project
4. Paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Repeat for `supabase/migrations/002_seed_data.sql`

You should now have:
- ✓ 3 workout types (Pull, Push, Lower)
- ✓ Exercise templates with defaults
- ✓ Empty sessions and session_entries tables

## Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Test the App

1. You should see the workout picker page
2. Click "Upper Body Pull" to start a session
3. You'll see exercises pre-filled with template values
4. Log some exercises and click "Finish Workout"
5. You'll see the Strava copy and progression suggestions

## Troubleshooting

### "Failed to fetch exercises"

- Check that your Supabase URL and key are correct in `.env.local`
- Verify you ran both migration files in Supabase
- Check the browser console for specific errors

### Service Worker Not Registering

- Service workers only work on localhost or HTTPS
- Check browser console for errors
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Build Errors

If you see TypeScript errors, try:
```bash
npm run build
```

This will show any compilation issues.

## Next Steps

1. **Replace Icons**: Update `public/icon-192.png` and `public/icon-512.png` with actual logo
2. **Customize Exercises**: Edit `supabase/migrations/002_seed_data.sql` and re-run
3. **Deploy**: Push to GitHub and deploy to Vercel
4. **Install as PWA**: On mobile, use "Add to Home Screen"

## Common Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```
