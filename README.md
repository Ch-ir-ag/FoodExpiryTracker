# Expiroo

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Digital Receipt Upload**: Upload your LIDL receipts and automatically extract food items
- **Expiry Date Tracking**: Get accurate predictions for when your food will expire
- **Enhanced Food Classification**: Comprehensive keyword-based classification for accurate food categorization
- **User Authentication**: Secure login with Google OAuth

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Enhanced Food Classification

Expiroo uses a comprehensive keyword-based classification system to accurately categorize food items and predict their shelf life. This feature:

- Uses an extensive database of food categories and their typical shelf lives
- Matches products against hundreds of keywords across multiple categories
- Provides accurate expiry date predictions based on food type
- Is completely offline - no external API calls needed

### How It Works

The classification system uses a two-tier approach:
1. First, it determines the main food category (dairy, meat, fruit, etc.)
2. Then, it identifies the specific subcategory for more precise shelf life prediction

For example, "Greek Yogurt" is first identified as a dairy product, then classified more specifically as yogurt, which has an estimated shelf life of 14 days when refrigerated.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setting Up Google OAuth

To enable Google Sign-In for Expiroo, follow these steps:

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the Application type
   - Add your app's domain to Authorized JavaScript origins (e.g., `https://yourdomain.com`)
   - Add your Supabase redirect URL to Authorized redirect URIs: 
     `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Note your Client ID and Client Secret

2. **Configure Supabase Authentication**:
   - Go to your [Supabase Dashboard](https://app.supabase.com/)
   - Navigate to Authentication > Providers
   - Find Google in the list and enable it
   - Enter your Google Client ID and Client Secret
   - Save the changes

3. **Update Your Site URL**:
   - In Supabase Dashboard, go to Authentication > URL Configuration
   - Set your Site URL to your application's URL
   - Add any additional redirect URLs if needed

After completing these steps, the Google Sign-In functionality will be available in your Expiroo application.
#   F o o d E x p i r y T r a c k e r 
 
 