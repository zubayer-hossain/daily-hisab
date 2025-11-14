# Supabase Setup Guide

## Fixing "Permission Denied for Schema Public" Error

This error occurs when Supabase Row Level Security (RLS) is blocking access. Since we're using **NextAuth** (not Supabase Auth), we need to configure Supabase properly.

## Solution: Use Service Role Key (Recommended)

The **service role key** bypasses RLS, which is perfect for server-side operations with NextAuth.

### Step 1: Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Find **service_role key** (secret) - **DO NOT expose this in client-side code!**
4. Copy the key

### Step 2: Add to Environment Variables

Add this to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (for server-side operations - bypasses RLS)
# ⚠️ NEVER expose this in client-side code!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/001_initial_schema.sql` from this project
4. Copy and paste the entire SQL into the editor
5. Click **Run** to create all tables

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

## Alternative: Disable RLS (Development Only)

If you don't want to use the service role key, you can disable RLS:

1. Go to Supabase Dashboard → **Authentication → Policies**
2. For each table, disable RLS (not recommended for production)

## Verify Setup

Run the connection check:

```bash
npm run db:check
```

## Security Notes

- ✅ **Service Role Key**: Use for server-side operations only (Next.js API routes, server components)
- ✅ **Anon Key**: Safe to expose in client-side code (browser)
- ⚠️ **Never expose service role key** in client-side code or browser console
- ⚠️ **Never commit** `.env` file to Git

## Troubleshooting

### Error: "permission denied for schema public"

**Cause**: RLS is enabled but no policies allow access, or tables don't exist.

**Solutions**:
1. ✅ Use service role key (recommended)
2. ✅ Run the SQL migration to create tables
3. ✅ Check that RLS is disabled or policies allow access

### Error: "relation does not exist"

**Cause**: Tables haven't been created yet.

**Solution**: Run the SQL migration in Supabase Dashboard → SQL Editor

### Error: "invalid input syntax for type uuid"

**Cause**: ID generation issue.

**Solution**: Make sure the migration includes `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
