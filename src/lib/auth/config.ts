import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  // Removed PrismaAdapter - using JWT sessions instead
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth user creation/lookup
      if (account?.provider === 'google' && account.providerAccountId) {
        try {
          // Check if user exists by Google ID
          let dbUser = await prisma.user.findUnique({
            where: { googleId: account.providerAccountId },
          });

          // If not found, check by email
          if (!dbUser && user.email) {
            dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
          }

          // Create user if doesn't exist
          if (!dbUser && user.email) {
            dbUser = await prisma.user.create({
              data: {
                name: user.name || '',
                email: user.email,
                image: user.image || null,
                googleId: account.providerAccountId,
                locale: 'bn',
                theme: 'dark',
              },
            });

            // Create default categories for new user
            const defaultCategories = [
              { name: 'Salary', nameBn: 'বেতন', color: '#10b981', icon: '💼', type: 'INCOME', order: 1 },
              { name: 'Business', nameBn: 'ব্যবসা', color: '#3b82f6', icon: '🏢', type: 'INCOME', order: 2 },
              { name: 'Investment', nameBn: 'বিনিয়োগ', color: '#8b5cf6', icon: '📈', type: 'INCOME', order: 3 },
              { name: 'Gift', nameBn: 'উপহার', color: '#ec4899', icon: '🎁', type: 'INCOME', order: 4 },
              { name: 'Others', nameBn: 'অন্যান্য', color: '#6b7280', icon: '💰', type: 'INCOME', order: 5 },
              { name: 'Food & Dining', nameBn: 'খাদ্য ও খাওয়া', color: '#ef4444', icon: '🍔', type: 'EXPENSE', order: 1 },
              { name: 'Transportation', nameBn: 'যাতায়াত', color: '#f59e0b', icon: '🚗', type: 'EXPENSE', order: 2 },
              { name: 'Shopping', nameBn: 'কেনাকাটা', color: '#ec4899', icon: '🛍️', type: 'EXPENSE', order: 3 },
              { name: 'Entertainment', nameBn: 'বিনোদন', color: '#8b5cf6', icon: '🎬', type: 'EXPENSE', order: 4 },
              { name: 'Bills & Utilities', nameBn: 'বিল ও ইউটিলিটি', color: '#06b6d4', icon: '💡', type: 'EXPENSE', order: 5 },
              { name: 'Healthcare', nameBn: 'স্বাস্থ্যসেবা', color: '#10b981', icon: '⚕️', type: 'EXPENSE', order: 6 },
              { name: 'Education', nameBn: 'শিক্ষা', color: '#3b82f6', icon: '📚', type: 'EXPENSE', order: 7 },
              { name: 'Rent', nameBn: 'ভাড়া', color: '#f97316', icon: '🏠', type: 'EXPENSE', order: 8 },
              { name: 'Insurance', nameBn: 'বীমা', color: '#14b8a6', icon: '🛡️', type: 'EXPENSE', order: 9 },
              { name: 'Others', nameBn: 'অন্যান্য', color: '#6b7280', icon: '📦', type: 'EXPENSE', order: 10 },
            ];

            await prisma.category.createMany({
              data: defaultCategories.map((cat) => ({
                ...cat,
                userId: dbUser.id,
                isDefault: true,
              })),
            });
          }

          // Update user ID and preferences for JWT token
          if (dbUser) {
            user.id = dbUser.id;
            // Store preferences in user object for JWT token
            (user as any).locale = dbUser.locale;
            (user as any).theme = dbUser.theme;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // Get preferences from token (set in jwt callback)
        if (token.locale) session.user.locale = token.locale as string;
        if (token.theme) session.user.theme = token.theme as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        // Store user preferences in token to avoid database calls in middleware
        if ((user as any).locale) token.locale = (user as any).locale;
        if ((user as any).theme) token.theme = (user as any).theme;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: 'jwt', // Changed to JWT for credentials provider compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};

