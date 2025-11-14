#!/usr/bin/env node

/**
 * Supabase Connection Verifier
 * Verifies your Supabase connection using Supabase client
 */

// Load .env files manually (no dotenv dependency needed)
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      // Skip comments and empty lines
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match && !process.env[match[1].trim()]) {
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          process.env[match[1].trim()] = value;
        }
      }
    });
  }
}

// Try loading .env files
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

const { createClient } = require('@supabase/supabase-js');

async function verifyConnection() {
  console.log('\n🔍 Verifying Supabase Connection...\n');

  // Check if Supabase credentials exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials are not set in your .env file!\n');
    console.log('📋 Required environment variables:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    console.log('📋 Steps to fix:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to: Settings → API');
    console.log('4. Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL');
    console.log('5. Copy "anon/public key" → NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('6. Add them to your .env file\n');
    process.exit(1);
  }

  console.log('✅ Supabase credentials are set');
  console.log(`   URL: ${supabaseUrl.substring(0, 40)}...`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

  // Test actual connection
  console.log('🔌 Testing Supabase connection...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection by querying users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError && usersError.code !== 'PGRST116') {
      // PGRST116 = relation does not exist (table not created yet)
      throw usersError;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(() => {
        // If RPC doesn't exist, try direct query
        return supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .then(() => ({ data: null, error: null }));
      });
    
    // Count users if table exists
    if (!usersError) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ Database is working! Found ${count || 0} users.`);
    } else {
      console.log('⚠️  Database tables not created yet.');
      console.log('   Run the SQL migration from: supabase/migrations/001_initial_schema.sql');
    }
    
    console.log('\n🎉 Your Supabase connection is working perfectly!\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      console.log('\n📋 Invalid Supabase credentials:');
      console.log('1. Verify NEXT_PUBLIC_SUPABASE_URL is correct');
      console.log('2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
      console.log('3. Get them from: https://supabase.com/dashboard → Settings → API\n');
    } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('\n📋 Database tables not created:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run the migration: supabase/migrations/001_initial_schema.sql');
      console.log('3. Then test again\n');
    } else if (error.message.includes("Can't reach")) {
      console.log('\n📋 Connection issue:');
      console.log('1. Check if your Supabase project is active (not paused)');
      console.log('2. Verify NEXT_PUBLIC_SUPABASE_URL is correct');
      console.log('3. Check your internet connection\n');
    } else {
      console.log('\n📋 General troubleshooting:');
      console.log('1. Verify NEXT_PUBLIC_SUPABASE_URL in .env file');
      console.log('2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file');
      console.log('3. Make sure .env file is in project root');
      console.log('4. Restart your dev server after changing .env');
      console.log('5. Check: https://supabase.com/dashboard\n');
    }
    
    process.exit(1);
  }
}

verifyConnection().catch(console.error);
