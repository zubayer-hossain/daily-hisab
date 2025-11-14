import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db/supabase';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  // Using JWT sessions with Supabase database
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

        const user = await db.getUserByEmail(credentials.email as string);

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
          let dbUser = await db.getUserByGoogleId(account.providerAccountId);

          // If not found, check by email
          if (!dbUser && user.email) {
            dbUser = await db.getUserByEmail(user.email);
          }

          // Create user if doesn't exist
          if (!dbUser && user.email) {
            dbUser = await db.createUser({
              name: user.name || '',
              email: user.email,
              image: user.image || null,
              googleId: account.providerAccountId,
              locale: 'bn',
              theme: 'dark',
            });

            // Create default categories for new user
            const defaultCategories = [
              { name: 'Salary', icon: '💼', order: 1, userId: dbUser.id, isDefault: true },
              { name: 'Business', icon: '🏢', order: 2, userId: dbUser.id, isDefault: true },
              { name: 'Investment', icon: '📈', order: 3, userId: dbUser.id, isDefault: true },
              { name: 'Gift', icon: '🎁', order: 4, userId: dbUser.id, isDefault: true },
              { name: 'Others', icon: '💰', order: 5, userId: dbUser.id, isDefault: true },
              { name: 'Food & Dining', icon: '🍔', order: 1, userId: dbUser.id, isDefault: true },
              { name: 'Transportation', icon: '🚗', order: 2, userId: dbUser.id, isDefault: true },
              { name: 'Shopping', icon: '🛍️', order: 3, userId: dbUser.id, isDefault: true },
              { name: 'Entertainment', icon: '🎬', order: 4, userId: dbUser.id, isDefault: true },
              { name: 'Bills & Utilities', icon: '💡', order: 5, userId: dbUser.id, isDefault: true },
              { name: 'Healthcare', icon: '⚕️', order: 6, userId: dbUser.id, isDefault: true },
              { name: 'Education', icon: '📚', order: 7, userId: dbUser.id, isDefault: true },
              { name: 'Rent', icon: '🏠', order: 8, userId: dbUser.id, isDefault: true },
              { name: 'Insurance', icon: '🛡️', order: 9, userId: dbUser.id, isDefault: true },
              { name: 'Others', icon: '📦', order: 10, userId: dbUser.id, isDefault: true },
            ];

            await db.createCategories(defaultCategories);
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

