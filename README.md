# Daily Hisab - দৈনিক হিসাব 💰

A modern, mobile-first web application for tracking daily income and expenses with full Bangla language support.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 💵 **Income & Expense Tracking** - Easy-to-use transaction management
- 📊 **Visual Reports** - Dashboard with summary cards and transaction lists
- 🎨 **Dark/Light Mode** - Beautiful UI with theme support
- 🇧🇩 **Bangla Language** - Full support for Bengali language (English also supported)
- 📱 **Mobile-First Design** - Optimized for mobile devices with responsive tabs
- 💰 **Multi-Currency Support** - Choose your preferred currency (BDT, USD, EUR, GBP, INR, PKR, JPY, CNY, AUD, CAD)
- 🔍 **Advanced Filters** - Search and filter transactions
- ♾️ **Infinite Scroll** - Lazy loading for better performance

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **React Query** - Server state management
- **next-intl** - Internationalization (i18n)

### Backend
- **Next.js API Routes** - Serverless API
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase JS Client** - Native Supabase client for database operations
- **NextAuth.js** - Authentication
- **Zod** - Schema validation

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## 📋 Prerequisites

- Node.js 20+
- Supabase account (free tier available)
- Google OAuth credentials

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/zubayer-hossain/daily-hisab.git
cd daily-hisab
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Go to **Settings → API** and copy:
      - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
      - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   
   ⚠️ **Important:** The service role key bypasses Row Level Security - keep it secret!

4. **Set up environment variables**

   Create a `.env` file in the root directory:
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="bn"
```

5. **Set up the database schema**

   Run the SQL migration in Supabase:
   
   a. Go to your Supabase project dashboard
   b. Navigate to **SQL Editor**
   c. Open `supabase/migrations/001_initial_schema.sql` from this project
   d. Copy and paste the SQL into the editor
   e. Click **Run** to create all tables
   
   ✅ This migration automatically fixes schema permissions and creates all tables
   
   Or use Supabase CLI:
   ```bash
   supabase db push
   ```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env` file

## 🔑 Generating NEXTAUTH_SECRET

```bash
# On Unix/Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 🧪 Testing

### Run unit tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run E2E tests
```bash
npm run test:e2e
```

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Deploy!

## 📂 Project Structure

```
daily-hisab-app/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/        # Protected routes
│   │   └── login/            # Auth routes
│   ├── components/            # React components
│   │   ├── ui/               # UI components (shadcn/ui)
│   │   ├── dashboard/        # Dashboard components
│   │   ├── transactions/     # Transaction components
│   │   ├── categories/       # Category components
│   │   ├── settings/         # Settings components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities
│   │   ├── db/               # Database helpers (Supabase)
│   │   ├── auth/             # Auth config
│   │   └── utils.ts          # Utility functions
│   ├── utils/                 # Supabase utilities
│   │   └── supabase/         # Supabase client helpers
│   ├── hooks/                 # Custom hooks
│   ├── types/                 # TypeScript types
│   └── i18n/                  # Internationalization
│       └── messages/         # Translation files (en.json, bn.json)
├── supabase/                  # Supabase migrations
│   └── migrations/          # SQL migration files
└── public/                    # Static assets
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `DATABASE_URL` | Not needed - using Supabase SQL migrations | No |
| `NEXTAUTH_URL` | App URL | Yes |
| `NEXTAUTH_SECRET` | Secret key for auth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language (bn/en) | Yes |

## 🗄️ Database

This project uses **Supabase** (PostgreSQL) for all database operations. The Supabase client is used directly for queries, providing:

- ✅ No prepared statement errors
- ✅ Better performance with Supabase infrastructure
- ✅ Edge Runtime compatibility
- ✅ Real-time capabilities (ready for future features)

**Note:** This project uses **Supabase SQL migrations** (see `supabase/migrations/`). All queries use Supabase client directly!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Workflow

1. Make changes to the code
2. Test locally with `npm run dev`
3. Run tests: `npm test`
4. Commit and push changes

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter "prepared statement does not exist" errors:
- Ensure you're using **Direct connection** (port 6543) in `DATABASE_URL`
- Check that your Supabase project is active (not paused)
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Reset Development Environment

```bash
npm run reset
```

This will:
- Stop all Node.js processes
- Clear Next.js cache

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Zubayer Hossain - [GitHub](https://github.com/zubayer-hossain)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [next-intl](https://next-intl-docs.vercel.app/)

---

**Made with ❤️ for the Bangladeshi community**
