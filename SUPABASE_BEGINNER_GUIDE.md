# Supabase Setup - Complete Beginner Guide

This guide assumes you've never used Supabase before. Follow each step carefully.

## What is Supabase?

Supabase is like a "backend in a box" - it gives you a database (like Excel but way more powerful) that your app can talk to over the internet. Think of it as a place where your workout data lives.

## Step 1: Create Your Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"** (green button, top right)
3. Sign up using:
   - GitHub (recommended - you already have this)
   - OR email/password
4. Verify your email if needed

## Step 2: Create Your First Project

1. After logging in, you'll see the Supabase dashboard
2. Click **"New Project"**
3. Fill in the form:
   - **Name**: `luka-forge` (or whatever you want)
   - **Database Password**: Create a STRONG password
     - ⚠️ **IMPORTANT**: Save this password somewhere safe!
     - You'll need it if you ever want to connect directly to the database
     - Suggestion: Use a password manager or Notes app
   - **Region**: Choose the one closest to you
     - If in Europe: `Europe (Frankfurt)` or `Europe (London)`
     - If in US: `US East (N. Virginia)` or `US West (Oregon)`
     - If elsewhere: Choose the closest option
   - **Pricing Plan**: Stay on **FREE** (more than enough for this app)
4. Click **"Create new project"**
5. ⏳ Wait 2-3 minutes while it sets up (you'll see a loading screen)

## Step 3: Get Your API Credentials

Once your project is ready:

1. Look for **"Project Settings"** in the left sidebar (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You'll see a page with important information. Find these two items:

   **A) Project URL**
   - Look for "Project URL" section
   - It looks like: `https://abcdefghijk.supabase.co`
   - Click the copy icon to copy it
   - Paste it somewhere safe (Notes app or similar)

   **B) anon public key**
   - Scroll down to "Project API keys"
   - Find the one labeled **"anon" "public"**
   - It's a LONG string of random letters/numbers
   - Click the copy icon to copy it
   - Paste it somewhere safe

## Step 4: Add Credentials to Your App

1. Open your project folder: `/Users/lukaravnikar/Desktop/Luka-strong`
2. Find the file `.env.local`
3. Open it in a text editor (TextEdit, VS Code, etc.)
4. You'll see this:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

5. Paste your credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_very_long_key_here
   ```

6. **Save the file** (Cmd+S or Ctrl+S)

## Step 5: Create Database Tables

Now we need to create the "tables" (like spreadsheets) where your workout data will be stored.

### 5A: Open SQL Editor

1. Back in Supabase dashboard
2. Click **"SQL Editor"** in left sidebar (looks like a </> icon)
3. Click **"New query"** button (top right)

### 5B: Run First Migration (Schema)

1. Open the file: `supabase/migrations/001_initial_schema.sql` in your project
2. **Select ALL the text** in that file (Cmd+A or Ctrl+A)
3. **Copy it** (Cmd+C or Ctrl+C)
4. Go back to Supabase SQL Editor
5. **Paste** the code into the editor (Cmd+V or Ctrl+V)
6. Click **"Run"** button (bottom right)
7. ✅ You should see: **"Success. No rows returned"**

   If you see an error:
   - Double-check you copied the ENTIRE file
   - Make sure you're in the right project
   - Try refreshing the page and running again

### 5C: Run Second Migration (Seed Data)

1. Click **"New query"** again (to get a fresh editor)
2. Open the file: `supabase/migrations/002_seed_data.sql`
3. **Select ALL and Copy** the text
4. **Paste** into Supabase SQL Editor
5. Click **"Run"**
6. ✅ You should see: **"Success. No rows returned"**

### 5D: Verify It Worked

Let's check that your workout templates were created:

1. In Supabase, click **"Table Editor"** in left sidebar
2. You should see 4 tables:
   - `exercises` (should have 21 rows)
   - `workout_types` (should have 3 rows)
   - `sessions` (empty - you haven't logged workouts yet)
   - `session_entries` (empty)
3. Click on **"exercises"** table
4. You should see your workout exercises listed (Lat Pulldown, Bench Press, etc.)

✅ If you see this, **you're done with Supabase setup!**

## Step 6: Test Your App

1. Open Terminal/Command Prompt
2. Navigate to your project:
   ```bash
   cd /Users/lukaravnikar/Desktop/Luka-strong
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open your browser to: **http://localhost:3000**
5. You should see the workout picker with 3 options

### Test a Workout:

1. Click **"Upper Body Pull"**
2. You should see 8 exercises with pre-filled weights
3. Change some numbers, click "Mark done" on a few
4. Click **"Finish Workout"**
5. You should see the Strava copy screen

### Verify Data Saved:

1. Go back to Supabase Table Editor
2. Click on **"sessions"** table
3. You should see 1 row (your workout!)
4. Click on **"session_entries"** table
5. You should see rows for each exercise you logged

🎉 **If you see data in Supabase, everything is working!**

## Common Issues & Solutions

### "Failed to fetch exercises"
- ✅ Check `.env.local` has correct URL and key
- ✅ Verify no extra spaces in `.env.local`
- ✅ Restart dev server (`Ctrl+C` then `npm run dev` again)

### "Anon key is not defined"
- ✅ Make sure `.env.local` file is in project root
- ✅ Check file is named exactly `.env.local` (not `.env.local.txt`)
- ✅ Restart dev server

### SQL Errors When Running Migrations
- ✅ Make sure you copied the ENTIRE file contents
- ✅ Run 001 before 002 (in order)
- ✅ If 002 fails, try running it again (duplicate inserts are ignored)

### Tables Not Showing in Supabase
- ✅ Refresh the Supabase dashboard page
- ✅ Make sure you ran both SQL migrations
- ✅ Check you're in the correct project (name shown at top)

## What Next?

Once this is all working:

1. ✅ Push code to GitHub (I'll help with this)
2. ✅ Use the app locally to log workouts
3. ✅ Eventually deploy to Vercel for access from anywhere

## Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Check what step you're on
3. Ask for help!

---

**Pro Tip**: Bookmark your Supabase project dashboard. You'll want to check it occasionally to see your workout data growing!
