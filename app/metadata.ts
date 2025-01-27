import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
}

export const metadata: Metadata = {
  title: {
    template: '%s | Scheduler App',
    default: 'Scheduler App - Employee Scheduling Made Easy',
  },
  description: 'Efficient employee scheduling and shift management system powered by Next.js and Supabase',
  applicationName: 'Scheduler App',
  authors: [{ name: 'Your Company Name' }],
  keywords: ['scheduling', 'employee management', 'shift planning', 'workforce management'],
  creator: 'Your Company Name',
  publisher: 'Your Company Name',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Scheduler App',
    title: 'Scheduler App - Employee Scheduling Made Easy',
    description: 'Efficient employee scheduling and shift management system powered by Next.js and Supabase',
    images: [
      {
        url: 'https://your-domain.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scheduler App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scheduler App - Employee Scheduling Made Easy',
    description: 'Efficient employee scheduling and shift management system powered by Next.js and Supabase',
    images: ['https://your-domain.com/twitter-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#2b5797',
    'msapplication-config': '/browserconfig.xml',
  },
} 