import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TransferProvider } from "@/context/TransferContext";
import { TeamProvider } from "@/context/TeamContext";
import CookieBanner from "@/components/CookieBanner";
import ToastContainer from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";

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
    default: "FlyFile - Condivisione File Sicura",
    template: "%s | FlyFile",
  },
  description: "La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end. Invia file di grandi dimensioni in modo sicuro, veloce e gratuito.",
  keywords: [
    "file sharing",
    "condivisione file",
    "trasferimento file",
    "invia file grandi",
    "crittografia AES-256",
    "file transfer sicuro",
    "condividere file online",
    "inviare file pesanti",
    "WeTransfer alternativa",
    "cloud storage sicuro",
  ],
  authors: [{ name: "FlyFile", url: "https://flyfile.it" }],
  creator: "FlyFile",
  publisher: "FlyFile",

  // Canonical URL
  alternates: {
    canonical: '/',
  },

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
    title: "FlyFile - Condivisione File Sicura",
    description: "La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end. Invia file di grandi dimensioni in modo sicuro e veloce.",
    type: "website",
    locale: "it_IT",
    url: "https://flyfile.it",
    siteName: "FlyFile",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "FlyFile - Condivisione File Sicura",
    description: "La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end.",
    creator: "@FlyFileIT",
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

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FlyFile',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end. Invia file di grandi dimensioni in modo sicuro e veloce.',
  url: 'https://flyfile.it',
  author: {
    '@type': 'Organization',
    name: 'FlyFile',
    url: 'https://flyfile.it',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Villapizzone, 26',
      addressLocality: 'Milano',
      postalCode: '20156',
      addressCountry: 'IT',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@flyfile.it',
    },
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white min-h-screen`}>
        <AuthProvider>
          <TransferProvider>
            <TeamProvider>
              {children}
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
