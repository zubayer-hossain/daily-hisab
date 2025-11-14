# Quick Fix: "Permission Denied for Schema Public" Error

## ✅ Step-by-Step Fix

### Step 1: Get Your Service Role Key

1. Open your Supabase project: https://supabase.com/dashboard
2. Go to **Settings** → **API**
3. Scroll down to find **service_role key** (it's marked as "secret")
4. Click the **eye icon** to reveal it
5. **Copy the entire key**

### Step 2: Add to Your `.env` File

Open your `.env` file in the project root and add this line:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-paste-here
```

**Important**: Replace `your-service-role-key-paste-here` with the actual key you copied.

Your `.env` should now look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Step 3: Verify Tables Exist

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

**If you see no tables** (or only `_prisma_migrations`), you need to run the migration:

1. Open `supabase/migrations/001_initial_schema.sql` from this project
2. Copy the entire SQL content
3. Paste it into Supabase SQL Editor
4. Click **Run**

### Step 4: Restart Your Dev Server

**IMPORTANT**: You MUST restart the server after adding the environment variable!

1. Stop the current server: Press `Ctrl+C` in the terminal
2. Start it again: `npm run dev`

### Step 5: Check the Console

When you restart, you should see this in the console:

```
[Supabase] Using service role key (bypasses RLS)
```

If you see this warning instead:

```
[Supabase] ⚠️  Service role key not found! Using anon key. Add SUPABASE_SERVICE_ROLE_KEY to .env to fix RLS issues.
```

Then the environment variable wasn't loaded. Make sure:
- ✅ The `.env` file is in the project root (same folder as `package.json`)
- ✅ You restarted the dev server after adding the variable
- ✅ The variable name is exactly: `SUPABASE_SERVICE_ROLE_KEY` (no typos)

## 🔍 Troubleshooting

### Still Getting the Error?

1. **Check if tables exist**:
   - Go to Supabase Dashboard → **Table Editor**
   - You should see: `users`, `categories`, `transactions`, etc.
   - If not, run the migration (Step 3 above)

2. **Verify environment variable**:
   - Make sure `.env` file is in the root directory
   - Check for typos in the variable name
   - Restart the dev server

3. **Check Supabase project status**:
   - Make sure your Supabase project is active (not paused)
   - Check: Supabase Dashboard → Settings → General

4. **Clear Next.js cache**:
   ```bash
   npm run reset
   npm run dev
   ```

## 🎯 Why This Works

- **Service Role Key** bypasses Row Level Security (RLS)
- Perfect for server-side operations with NextAuth
- Safe because it's only used in server-side code (never exposed to browser)

## ⚠️ Security Reminder

- ✅ **DO** use service role key in `.env` (server-side only)
- ❌ **DON'T** expose it in client-side code
- ❌ **DON'T** commit `.env` to Git

