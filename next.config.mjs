import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Server Actions are stable in Next.js 16, bodySizeLimit can be set via environment variable
  // or removed if default is sufficient
};

// Note: PWA configuration should be handled by next-pwa wrapper if needed
// For now, removing the invalid pwa config key
export default withNextIntl(nextConfig);

