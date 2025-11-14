# Setup Guide - Daily Hisab App 🚀

This guide will help you set up the Daily Hisab application from scratch using Supabase.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] Supabase account (free tier available at [supabase.com](https://supabase.com))
- [ ] Google Account for OAuth setup
- [ ] Git installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Supabase client libraries
- NextAuth.js for authentication
- UI libraries (Tailwind, shadcn/ui)
- Testing tools (Vitest, Playwright)

### 2. Supabase Database Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Fill in project details:
     - Name: Daily Hisab
     - Database Password: (choose a strong password)
     - Region: Choose closest to you
   - Click "Create new project"
   - Wait 1-2 minutes for project to be ready

2. **Get Supabase API Keys**
   - Go to **Settings → API**
   - Copy **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon/public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role key** (secret) → This is your `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Important:** The service role key is sensitive - never expose it in client-side code!

### 3. Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select a Project**
   - Click "Select a project" → "New Project"
   - Name it "Daily Hisab" → Create

3. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" → Enable it

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" → Create
   - Fill in:
     - App name: Daily Hisab
     - User support email: your email
     - Developer contact: your email
   - Save and Continue
   - Skip Scopes → Save and Continue
   - Add test users (your email) → Save

5. **Create OAuth Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: Daily Hisab Web Client
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click Create
   - **Copy the Client ID and Client Secret**

### 4. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
# On Unix/Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 5. Complete Environment Variables

Create a `.env` file in the project root with:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="bn"
```

### 6. Initialize Database Schema

Run the SQL migration in Supabase:

**Option 1: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

✅ This migration script automatically:
- Fixes schema permissions (resolves "permission denied" errors)
- Creates all database tables (users, accounts, sessions, categories, transactions, backups)
- Sets up indexes for performance
- Creates auto-update triggers
- Grants permissions to service_role

**Option 2: Using Supabase CLI**
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎉 You're All Set!

The application should now be running. You can:

1. Sign up with email/password or Google OAuth
2. Create categories for income and expenses
3. Add transactions
4. View dashboard with summaries
5. Change language (Bengali/English) and currency in settings

## 🔧 Troubleshooting

### "Permission denied for schema public" Error

This is now automatically fixed by the migration script! If you still see this error:
1. Make sure you've run `supabase/migrations/001_initial_schema.sql`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file
3. Restart your dev server: `npm run dev`

See `supabase/README.md` for more details.

### Database Connection Issues

If you can't connect to Supabase:
- Check that your Supabase project is active (not paused)
- Verify all three Supabase keys are correctly set in `.env`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Restart your dev server after changing `.env`

### Reset Development Environment

```bash
npm run reset
```

This will:
- Stop all Node.js processes
- Clear Next.js cache

## 📚 Next Steps

- Read the [README.md](README.md) for more information
- Check out the project structure
- Explore the API routes in `src/app/api/`
- Customize the UI components in `src/components/`

## 🆘 Need Help?

- Check Supabase dashboard for database status
- Verify all environment variables are set correctly
- Make sure your Supabase project is not paused
- Check the browser console for errors
