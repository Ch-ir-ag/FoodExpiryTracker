import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Expiroo",
  description: "Track your food expiry dates and reduce waste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "qqt5hsmw3s");
          `}
        </Script>
      </head>
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
