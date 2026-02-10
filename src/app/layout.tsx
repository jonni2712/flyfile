import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TransferProvider } from "@/context/TransferContext";
import { TeamProvider } from "@/context/TeamContext";
import CookieBanner from "@/components/CookieBanner";
import ToastContainer from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";

// Google Analytics ID
const GA_MEASUREMENT_ID = "G-W4J7Q31Y7B";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7c3aed',
};

export const metadata: Metadata = {
  // Base URL for canonical URLs
  metadataBase: new URL('https://flyfile.it'),

  // Basic metadata
  title: {
    default: "FlyFile — Invia File Online Gratis | Trasferimento Sicuro",
    template: "%s | FlyFile",
  },
  description: "Invia file online gratis fino a 5GB con crittografia AES-256 end-to-end. Trasferimento file sicuro, veloce e senza registrazione. La migliore alternativa a WeTransfer.",
  keywords: [
    "invia file online",
    "invia file online gratis",
    "inviare file grandi",
    "trasferimento file online",
    "trasferimenti file online",
    "condivisione file",
    "condividere file online",
    "condivisione file sicura",
    "file sharing",
    "file sharing sicuro",
    "file transfer sicuro",
    "inviare file pesanti",
    "mandare file grandi",
    "invio file gratis",
    "alternativa WeTransfer",
    "WeTransfer alternativa italiana",
    "crittografia AES-256",
    "trasferire file grandi gratis",
    "cloud storage sicuro",
    "invio file crittografato",
  ],
  authors: [{ name: "FlyFile", url: "https://flyfile.it" }],
  creator: "FlyFile",
  publisher: "FlyFile",

  // Robots
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

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },

  // Manifest for PWA
  manifest: '/manifest.json',

  // Open Graph
  openGraph: {
    title: "FlyFile — Invia File Online Gratis | Trasferimento Sicuro",
    description: "Invia file online gratis fino a 5GB con crittografia AES-256 end-to-end. Trasferimento file sicuro, veloce e senza registrazione.",
    type: "website",
    locale: "it_IT",
    url: "https://flyfile.it",
    siteName: "FlyFile",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlyFile - Invia File Online Sicuro' }],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "FlyFile — Invia File Online Gratis",
    description: "Trasferimento file online sicuro con crittografia AES-256. Gratis, senza registrazione.",
    creator: "@FlyFileIT",
    images: ['/og-image.png'],
  },

  // Verification (add your codes when available)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // App-specific
  applicationName: "FlyFile",
  category: "technology",
};

// JSON-LD Structured Data — @graph for sitelinks
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // WebSite
    {
      '@type': 'WebSite',
      name: 'FlyFile',
      alternateName: ['FlyFile.it', 'Fly File'],
      url: 'https://flyfile.it',
      inLanguage: 'it-IT',
    },
    // Organization
    {
      '@type': 'Organization',
      name: 'FlyFile',
      url: 'https://flyfile.it',
      logo: 'https://flyfile.it/og-image.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via Villapizzone, 26',
        addressLocality: 'Milano',
        postalCode: '20156',
        addressCountry: 'IT',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'support@flyfile.it',
          availableLanguage: 'Italian',
        },
      ],
    },
    // SiteNavigationElement
    {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'SiteNavigationElement', position: 1, name: 'Funzionalità', url: 'https://flyfile.it/funzionalita' },
        { '@type': 'SiteNavigationElement', position: 2, name: 'Prezzi', url: 'https://flyfile.it/prezzi' },
        { '@type': 'SiteNavigationElement', position: 3, name: 'Sicurezza', url: 'https://flyfile.it/sicurezza' },
        { '@type': 'SiteNavigationElement', position: 4, name: 'Chi Siamo', url: 'https://flyfile.it/chi-siamo' },
        { '@type': 'SiteNavigationElement', position: 5, name: 'Documentazione', url: 'https://flyfile.it/documentazione' },
        { '@type': 'SiteNavigationElement', position: 6, name: 'Contatti', url: 'https://flyfile.it/contatti' },
        { '@type': 'SiteNavigationElement', position: 7, name: 'Supporto', url: 'https://flyfile.it/supporto' },
      ],
    },
    // SoftwareApplication
    {
      '@type': 'SoftwareApplication',
      name: 'FlyFile',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Invia file online gratis fino a 5GB con crittografia AES-256 end-to-end. Trasferimento file sicuro, veloce e senza registrazione.',
      url: 'https://flyfile.it',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '0',
        highPrice: '20',
        offerCount: '4',
      },
      featureList: [
        'Crittografia AES-256 end-to-end',
        'Trasferimento file fino a 5GB gratuito',
        'Protezione con password',
        'Link di download sicuri',
        'Nessuna registrazione richiesta',
      ],
    },
  ],
};

export default function RootLayout({
  children,
  settings,
}: Readonly<{
  children: React.ReactNode;
  settings: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5065560716215945"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white min-h-screen`}>
        <AuthProvider>
          <TransferProvider>
            <TeamProvider>
              {children}
              {settings}
              <CookieBanner />
              <ToastContainer />
            </TeamProvider>
          </TransferProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
