import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';

import { env } from '@/config/env';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import { QueryProvider } from '@/providers/query-provider';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'YouTube Subtitle Editor',
  description: 'Extract, edit, and export subtitles with precision timing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <AnalyticsProvider>
          <QueryProvider>{children}</QueryProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
