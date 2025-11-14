# Supabase Migrations

This directory contains SQL migrations for Supabase database.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `001_initial_schema.sql`
4. Paste and run it in the SQL Editor

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migration Files

- `001_initial_schema.sql` - Initial database schema with all tables

## Notes

- Migrations are idempotent (safe to run multiple times)
- Uses `CREATE TABLE IF NOT EXISTS` to prevent errors on re-run
- All foreign keys have `ON DELETE CASCADE` for data integrity

