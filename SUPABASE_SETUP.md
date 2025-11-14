# ============================================
# SUPABASE CONNECTION TROUBLESHOOTING
# ============================================

# STEP 1: Check if Database is Paused
# Go to: https://supabase.com/dashboard
# Select your project
# If you see "Paused" or "Restore" button, click it
# Wait 1-2 minutes for database to resume

# STEP 2: Get Correct Connection String
# 1. Go to: Settings â†’ Database
# 2. Scroll to "Connection string" section  
# 3. Click "URI" tab
# 4. Copy the "Direct connection" string (port 5432)
# 5. It should look like:
#    postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
#
# OR (Connection Pooler - sometimes more reliable):
#    postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# STEP 3: Update .env file
# Replace DATABASE_URL with the exact string from Supabase
# Make sure to replace [PASSWORD] with your actual password
# If password has special characters, Supabase provides it already encoded

# STEP 4: Test Connection
# Run: npm run db:push
