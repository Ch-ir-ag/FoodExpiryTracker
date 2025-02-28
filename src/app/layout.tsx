import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Food Expiry Tracker",
  description: "Track your food expiry dates and reduce waste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.875rem',
              },
              success: {
                duration: 2000,
              },
              error: {
                duration: 3000,
              },
            }}
          />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
