// Quick script to test database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...\n');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if your Supabase database is paused');
    console.error('   → Go to: https://supabase.com/dashboard');
    console.error('   → Select your project');
    console.error('   → Click "Resume" or "Restore" if paused');
    console.error('\n2. Verify your connection string in .env file');
    console.error('   → Get it from: Settings → Database → Connection string');
    console.error('   → Use "Direct connection" format (port 5432)');
    console.error('\n3. Check your database password');
    console.error('   → Make sure it matches your Supabase project password');
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

