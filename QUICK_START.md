# Quick Start Guide ⚡

Get Daily Hisab running in **10 minutes**!

## Prerequisites
- Node.js 20+
- PostgreSQL database (local or cloud)
- Google account

---

## 🚀 5-Step Setup

### Step 1: Install Dependencies (2 min)
```bash
npm install
```

### Step 2: Configure Environment (3 min)
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Use Supabase for quick setup (free): https://supabase.com
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

### Step 3: Setup Google OAuth (3 min)

Quick steps:
1. Go to: https://console.cloud.google.com
2. Create project → Enable Google+ API
3. OAuth consent screen → External → Fill basic info
4. Create OAuth Client → Web application
5. Authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID & Secret to `.env`

### Step 4: Initialize Database (1 min)
```bash
npm run db:push
npm run db:seed
```

### Step 5: Start Development (1 min)
```bash
npm run dev
```

Open: http://localhost:3000

---

## ✅ Verify Setup

1. ✅ App loads at http://localhost:3000
2. ✅ Click "Sign in with Google"
3. ✅ Complete Google OAuth
4. ✅ See dashboard with summary cards

---

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Open database GUI

# Testing
npm test                 # Run unit tests
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests

# Database
npm run db:push          # Push schema changes
npm run db:migrate       # Create migration
npm run db:seed          # Seed data

# Production
npm run build            # Build for production
npm start                # Start production server
```

---

## 🆘 Quick Fixes

### Can't connect to database?
```bash
# Test connection
npx prisma studio
```

### Google OAuth not working?
- Check redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Verify Client ID and Secret in `.env`

### Module errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors?
```bash
npx prisma generate
npx prisma db push
```

---

## 📚 Learn More

- Full setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Project details: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🎉 You're Ready!

Start building features:
- Add more transaction types
- Create reports
- Build charts
- Add categories
- Export data

Happy coding! 💻

