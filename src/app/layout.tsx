import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';

import { ThemeProvider } from '@/app/(main)/_components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toast';
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
  title: {
    default: 'YTSub - Learn Korean with YouTube Videos',
    template: '%s | YTSub',
  },
  description:
    'Learn Korean through YouTube videos with interactive subtitles. Practice pronunciation, study grammar and culture, master shadowing, and test your knowledge with quizzes. The best platform for foreigners learning Korean.',
  keywords: [
    'learn korean',
    'korean learning',
    'korean language learning',
    'korean pronunciation practice',
    'korean shadowing',
    'korean grammar practice',
    'korean culture learning',
    'youtube korean learning',
    'korean subtitles',
    'korean quiz',
    'korean study platform',
    'learn korean online',
    'korean language app',
    'korean speaking practice',
    'korean listening practice',
  ],
  authors: [{ name: 'YTSub' }],
  creator: 'YTSub',
  publisher: 'YTSub',
  metadataBase: new URL('https://ytsub.org'),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ytsub.org',
    siteName: 'YTSub',
    title: 'YTSub - Learn Korean with YouTube Videos',
    description:
      'Learn Korean through YouTube videos with interactive subtitles. Practice pronunciation, study grammar and culture, master shadowing, and test your knowledge with quizzes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YTSub - Learn Korean with YouTube Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YTSub - Learn Korean with YouTube Videos',
    description:
      'Learn Korean through YouTube videos with interactive subtitles. Practice pronunciation, study grammar and culture, master shadowing, and test your knowledge with quizzes.',
    images: ['/og-image.png'],
    creator: '@ytsub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = env.NEXT_PUBLIC_GA_ID;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'YTSub',
    description:
      'Learn Korean through YouTube videos with interactive subtitles. Practice pronunciation, study grammar and culture, master shadowing, and test your knowledge with quizzes. The best platform for foreigners learning Korean.',
    url: 'https://ytsub.org',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Learn Korean with YouTube videos',
      'Practice pronunciation with subtitles',
      'Study Korean grammar and culture',
      'Master shadowing practice',
      'Test knowledge with quizzes',
      'Save favorite dialogues',
      'Interactive subtitle learning',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AnalyticsProvider>
            <QueryProvider>
              <div className="bg-background min-h-screen">
                <Header />
                {children}
              </div>
              <Toaster />
            </QueryProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
