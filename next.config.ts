import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin();

const config = {
  reactStrictMode: true,
  images: {
    domains: [
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      'lh3.googleusercontent.com', // For Google Auth avatars
    ],
  },
  // Enable typed routes for better i18n support
  typedRoutes: true
};

const nextConfig = withNextIntl(
  withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  })(config)
);

export default nextConfig;
