# Setup Guide - Daily Hisab App 🚀

This guide will help you set up the Daily Hisab application from scratch.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] PostgreSQL installed locally or access to a cloud database
- [ ] Google Account for OAuth setup
- [ ] Git installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Prisma, PostgreSQL client
- NextAuth.js for authentication
- UI libraries (Tailwind, shadcn/ui)
- Testing tools (Vitest, Playwright)

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE daily_hisab;
```

3. Update `.env` with your connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/daily_hisab?schema=public"
```

#### Option B: Cloud Database (Recommended)

Use one of these free options:

**Supabase** (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings → Database
4. Update `.env` with the connection string

**Neon** 
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env`

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

6. **Update .env file**
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   ```

### 4. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
# On Unix/Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Add it to `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### 5. Complete Environment Variables

Your final `.env` file should look like this:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/daily_hisab?schema=public"

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

### 6. Initialize Database

Push the Prisma schema to your database:

```bash
npm run db:push
```

This will create all necessary tables.

### 7. Seed Database (Optional)

Add default categories and test data:

```bash
npm run db:seed
```

### 8. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Verification Steps

1. **Check if app loads**: Open http://localhost:3000
2. **Test login**: Click "Sign in with Google"
3. **Verify redirect**: You should be redirected to Google OAuth
4. **Complete sign in**: Sign in with your Google account
5. **Check dashboard**: You should see the dashboard with summary cards

## Common Issues & Solutions

### Issue: "Invalid client" error

**Solution**: 
- Double-check your Google Client ID and Secret
- Make sure the redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Verify the OAuth consent screen is configured

### Issue: Database connection error

**Solution**:
- Verify PostgreSQL is running
- Check the DATABASE_URL format
- Ensure the database exists
- Test connection with: `npx prisma studio`

### Issue: "Module not found" errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma client errors

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate
```

## Development Tools

### Prisma Studio (Database GUI)

View and edit your database visually:

```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Next Steps

Once setup is complete:

1. ✅ Create your first transaction
2. ✅ Explore the dashboard
3. ✅ Try different categories
4. ✅ Test dark/light mode
5. ✅ Check reports page (coming soon)
6. ✅ Test on mobile device

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables (same as `.env`)
4. Update `NEXTAUTH_URL` to your production URL
5. Add production URL to Google OAuth redirect URIs
6. Deploy!

### Update Google OAuth for Production

1. Go to Google Cloud Console
2. Edit your OAuth Client ID
3. Add production redirect URI:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
4. Update `.env` on Vercel with production URL

## Getting Help

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/yourusername/daily-hisab-app/issues)
- 💬 [Discussions](https://github.com/yourusername/daily-hisab-app/discussions)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy Tracking! 💰**

