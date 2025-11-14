import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      locale?: string;
      theme?: string;
    } & DefaultSession['user'];
  }

  interface User {
    locale?: string;
    theme?: string;
  }
}

