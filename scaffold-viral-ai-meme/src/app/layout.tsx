import type { Metadata, Viewport } from 'next';
import { siteConfig } from '../../site.config';
import { generateSchema } from '../lib/schema';
import { domTranslationGuardScript } from '../lib/dom-guard';
import { AuthProvider } from '../lib/auth-context';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(`https://${siteConfig.domain}`),
  alternates: {
    canonical: `https://${siteConfig.domain}`,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: `https://${siteConfig.domain}`,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'uYdiCU_vzp7R51TS9rxBaXLrOo6_P-atTJOtOjnQXpU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { websiteSchema, softwareSchema, faqSchema } = generateSchema();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Search Console Ownership Verification */}
        <meta name="google-site-verification" content="uYdiCU_vzp7R51TS9rxBaXLrOo6_P-atTJOtOjnQXpU" />
        {/* Favicon & Web App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* DOM translation guard to prevent Google Translate React crash */}
        <script dangerouslySetInnerHTML={{ __html: domTranslationGuardScript }} />
        {/* Google Identity Services for Google Login */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        {/* Ahrefs Web Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var ahrefs_analytics_script = document.createElement('script');
              ahrefs_analytics_script.async = true;
              ahrefs_analytics_script.src = 'https://analytics.ahrefs.com/analytics.js';
              ahrefs_analytics_script.setAttribute('data-key', 'ZEfmbQDvCk/G2cxjmCWtFw');
              document.getElementsByTagName('head')[0].appendChild(ahrefs_analytics_script);
            `,
          }}
        />
        {/* Optional Google Analytics 4 (GA4) */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
        {/* Schema.org JSON-LD Injections for Google SERP Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-screen bg-[#090b0c] text-white flex flex-col antialiased">
        <AuthProvider>
          <Toaster richColors position="top-center" theme="dark" closeButton />
          {children}
        </AuthProvider>
        {/* Vercel Web Analytics Real-Time Tracking */}
        <Analytics />
      </body>
    </html>
  );
}
