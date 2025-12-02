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
  title: {
    default: 'YTSub - Download, Edit, Sync YouTube Subtitles',
    template: '%s | YTSub',
  },
  description:
    'Download YouTube subtitles, edit subtitle timing, and sync YouTube captions with precision. Free online YouTube subtitle editor for learners, translators, and video editors.',
  keywords: [
    'download youtube subtitle',
    'edit youtube subtitle',
    'sync youtube subtitle',
    'youtube subtitle editor',
    'youtube caption download',
    'subtitle extractor',
    'subtitle timing editor',
    'youtube srt download',
    'youtube vtt download',
  ],
  authors: [{ name: 'YTSub' }],
  creator: 'YTSub',
  publisher: 'YTSub',
  metadataBase: new URL('https://ytsub.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ytsub.org',
    siteName: 'YTSub',
    title: 'YTSub - Download, Edit, Sync YouTube Subtitles',
    description:
      'Download YouTube subtitles, edit subtitle timing, and sync YouTube captions with precision. Free online YouTube subtitle editor.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YTSub - YouTube Subtitle Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YTSub - Download, Edit, Sync YouTube Subtitles',
    description:
      'Download YouTube subtitles, edit subtitle timing, and sync YouTube captions with precision. Free online YouTube subtitle editor.',
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
      'Download YouTube subtitles, edit subtitle timing, and sync YouTube captions with precision. Free online YouTube subtitle editor for learners, translators, and video editors.',
    url: 'https://ytsub.org',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Download YouTube subtitles',
      'Edit YouTube subtitle timing',
      'Sync YouTube captions',
      'Export subtitles in SRT format',
      'Export subtitles in VTT format',
    ],
  };

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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <AnalyticsProvider>
          <QueryProvider>{children}</QueryProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
