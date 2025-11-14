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

- `001_initial_schema.sql` - Complete database setup including:
  - ✅ Schema permission fixes (resolves "permission denied" errors)
  - ✅ All database tables (users, accounts, sessions, categories, transactions, backups)
  - ✅ Indexes for performance optimization
  - ✅ Auto-update triggers for timestamps
  - ✅ Service role permissions for NextAuth

## Notes

- ✅ **Includes permission fixes** - No need for separate permission scripts
- ✅ **Idempotent migrations** - Safe to run multiple times
- ✅ Uses `CREATE TABLE IF NOT EXISTS` to prevent errors on re-run
- ✅ All foreign keys have `ON DELETE CASCADE` for data integrity
- ✅ Automatically grants permissions to `service_role` for NextAuth

## Troubleshooting

### "Permission denied for schema public" Error

This error is now fixed automatically by the migration script. The script includes:
```sql
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

If you still see this error:
1. Make sure you've run the `001_initial_schema.sql` script
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file
3. Restart your Next.js dev server: `npm run dev`

