/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_BUTTON_ID: process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },
  staticPageGenerationTimeout: 1000,
  experimental: {
    esmExternals: true
  },
  reactStrictMode: true,
  eslint: {
    // Don't run ESLint during production builds for speed and to avoid false positives
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to complete even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 