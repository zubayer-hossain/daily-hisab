# Daily Hisab - দৈনিক হিসাব 💰

A modern, mobile-first web application for tracking daily income and expenses with full Bangla language support.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 💵 **Income & Expense Tracking** - Easy-to-use transaction management
- 📊 **Visual Reports** - Pie charts, bar charts, and category-wise breakdown
- 📅 **Calendar View** - Filter transactions by date
- 🎨 **Dark/Light Mode** - Beautiful UI with theme support
- 🇧🇩 **Bangla Language** - Full support for Bengali language
- 📱 **Mobile-First Design** - Optimized for mobile devices
- 💾 **Google Drive Backup** - Automatic backup to Google Drive
- 🔍 **Advanced Filters** - Search and filter by category, date, amount
- 📴 **Offline Support** - PWA with offline capabilities

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Zustand** - State management
- **React Query** - Server state management
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe ORM
- **NextAuth.js** - Authentication
- **Google Drive API** - Backup storage

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Google OAuth credentials
- Google Drive API credentials (for backup)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/daily-hisab-app.git
cd daily-hisab-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/daily_hisab"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Set up the database**
```bash
npm run db:push
npm run db:seed
```

5. **Run the development server**
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
3. Add environment variables
4. Deploy!

### Docker

```bash
docker build -t daily-hisab .
docker run -p 3000:3000 daily-hisab
```

## 📂 Project Structure

```
daily-hisab-app/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Protected routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # UI components (shadcn/ui)
│   │   ├── dashboard/        # Dashboard components
│   │   ├── transactions/     # Transaction components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities
│   │   ├── db/               # Database config
│   │   ├── auth/             # Auth config
│   │   └── services/         # Business logic
│   ├── hooks/                 # Custom hooks
│   ├── store/                 # State management
│   ├── types/                 # TypeScript types
│   └── i18n/                  # Internationalization
├── prisma/                    # Database schema
├── tests/                     # Test files
└── public/                    # Static assets
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | App URL | Yes |
| `NEXTAUTH_SECRET` | Secret key for auth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_DRIVE_CLIENT_ID` | Google Drive API client ID | Optional |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Google Drive API secret | Optional |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Workflow

This project follows **Test-Driven Development (TDD)**:

1. Write a failing test
2. Write minimal code to pass the test
3. Refactor the code
4. Repeat

## 🐛 Known Issues

- [ ] PWA offline mode needs optimization
- [ ] Google Drive backup is in beta

## 🗺️ Roadmap

- [ ] Export reports as PDF/Excel
- [ ] Recurring transactions
- [ ] Budget planning
- [ ] Multi-currency support
- [ ] Shared accounts
- [ ] Receipt scanning with OCR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Your Name - [@yourusername](https://twitter.com/yourusername)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

---

**Made with ❤️ for the Bangladeshi community**

