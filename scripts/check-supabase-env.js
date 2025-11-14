#!/usr/bin/env node

/**
 * Check Supabase environment variables
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

console.log('🔍 Checking Supabase Environment Variables...\n');

const required = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const optional = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

let hasErrors = false;

// Check required variables
console.log('📋 Required Variables:');
for (const [key, value] of Object.entries(required)) {
  if (value) {
    const masked = key.includes('KEY') 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`  ✅ ${key}: ${masked}`);
  } else {
    console.log(`  ❌ ${key}: MISSING`);
    hasErrors = true;
  }
}

console.log('\n📋 Optional Variables:');
if (optional.SUPABASE_SERVICE_ROLE_KEY) {
  const masked = `${optional.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...${optional.SUPABASE_SERVICE_ROLE_KEY.substring(optional.SUPABASE_SERVICE_ROLE_KEY.length - 4)}`;
  console.log(`  ✅ SUPABASE_SERVICE_ROLE_KEY: ${masked}`);
  console.log('  💡 Service role key found - RLS will be bypassed');
} else {
  console.log(`  ⚠️  SUPABASE_SERVICE_ROLE_KEY: NOT SET`);
  console.log('  ⚠️  Without service role key, you may get "permission denied" errors');
  console.log('  💡 Get it from: Supabase Dashboard → Settings → API → service_role key');
}

console.log('\n📝 Recommendations:');

if (!optional.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('  1. Add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.log('  2. Get it from: Supabase Dashboard → Settings → API → service_role key (secret)');
  console.log('  3. This will bypass RLS and fix "permission denied" errors');
}

if (hasErrors) {
  console.log('\n❌ Missing required environment variables!');
  console.log('   Please check your .env file.\n');
  process.exit(1);
} else {
  console.log('\n✅ All required variables are set!\n');
  
  if (!optional.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⚠️  Warning: Service role key not set. You may encounter RLS errors.');
    console.log('   Add SUPABASE_SERVICE_ROLE_KEY to fix this.\n');
  } else {
    console.log('🎉 Configuration looks good!\n');
  }
}

