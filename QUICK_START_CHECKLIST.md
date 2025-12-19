# 🚀 Quick Start Checklist

Follow these steps in order. Check them off as you go!

## Part 1: GitHub Setup (5 minutes)

- [ ] Go to https://github.com/new
- [ ] Create repository named: `luka-strong`
- [ ] Leave all checkboxes UNCHECKED
- [ ] Click "Create repository"
- [ ] Tell Claude you created it (so I can push the code)

## Part 2: Supabase Setup (10 minutes)

Follow [SUPABASE_BEGINNER_GUIDE.md](SUPABASE_BEGINNER_GUIDE.md) step-by-step:

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project (wait for it to finish setting up)
- [ ] Copy your Project URL
- [ ] Copy your anon public key
- [ ] Paste both into `.env.local` file
- [ ] Open Supabase SQL Editor
- [ ] Run `001_initial_schema.sql` migration
- [ ] Run `002_seed_data.sql` migration
- [ ] Verify tables were created (check Table Editor)

## Part 3: Test Locally (5 minutes)

- [ ] Open Terminal/Command Prompt
- [ ] Run: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Click "Upper Body Pull"
- [ ] Log a few exercises
- [ ] Click "Finish Workout"
- [ ] See Strava copy and progression suggestions
- [ ] Check Supabase Table Editor - your data should be there!

## Part 4: Deploy to Vercel (Optional, 10 minutes)

- [ ] Create account at https://vercel.com
- [ ] Click "New Project"
- [ ] Import your `luka-strong` GitHub repo
- [ ] Add environment variables (same as `.env.local`)
- [ ] Deploy!
- [ ] Access your app from anywhere

## You're Done! 🎉

Your app is now:
- ✅ On GitHub (backed up, version controlled)
- ✅ Connected to Supabase (data persisted)
- ✅ Running locally (ready to use)
- ✅ (Optional) Deployed (accessible from phone)

## Daily Use

1. Open http://localhost:3000 (or your Vercel URL)
2. Pick a workout
3. Log your exercises
4. Finish and copy to Strava
5. Your data is automatically saved!

## Where's My Data?

- **Local**: Cached in your browser (works offline)
- **Cloud**: Synced to Supabase (accessible anywhere)
- **Check it**: Supabase Dashboard → Table Editor

## Customization Later

Once comfortable, you can:
- Edit exercise templates (modify `002_seed_data.sql` and re-run)
- Adjust progression rules ([lib/progression.ts](lib/progression.ts))
- Change colors ([tailwind.config.ts](tailwind.config.ts))
- Replace icons ([public/icon-192.png](public/icon-192.png), [public/icon-512.png](public/icon-512.png))

## Need Help?

Stuck on any step? Just ask! Include:
- Which step you're on
- What error you're seeing
- Screenshot if possible
