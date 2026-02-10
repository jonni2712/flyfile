import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7c3aed",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  const localePrefix = locale === "it" ? "" : `/${locale}`;
  const url = `https://flyfile.it${localePrefix}`;

  // Generate alternates for all locales
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://flyfile.it${l === "it" ? "" : `/${l}`}`;
  }

  return {
    metadataBase: new URL("https://flyfile.it"),
    title: {
      default: t("title"),
      template: "%s | FlyFile",
    },
    description: t("description"),
    authors: [{ name: "FlyFile", url: "https://flyfile.it" }],
    creator: "FlyFile",
    publisher: "FlyFile",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
    },
    manifest: "/manifest.json",
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "it" ? "it_IT" : locale === "en" ? "en_US" : locale === "de" ? "de_DE" : locale === "fr" ? "fr_FR" : "es_ES",
      url,
      siteName: "FlyFile",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "FlyFile",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: "@FlyFileIT",
      images: ["/og-image.png"],
    },
    applicationName: "FlyFile",
    category: "technology",
    alternates: {
      canonical: url,
      languages,
    },
  };
}

export default async function LocaleLayout({
  children,
  settings,
  params,
}: Readonly<{
  children: React.ReactNode;
  settings: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "FlyFile",
        alternateName: ["FlyFile.it", "Fly File"],
        url: "https://flyfile.it",
        inLanguage: locale === "it" ? "it-IT" : locale === "en" ? "en-US" : locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : "es-ES",
      },
      {
        "@type": "Organization",
        name: "FlyFile",
        url: "https://flyfile.it",
        logo: "https://flyfile.it/og-image.png",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Via Villapizzone, 26",
          addressLocality: "Milano",
          postalCode: "20156",
          addressCountry: "IT",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: "support@flyfile.it",
            availableLanguage: ["Italian", "English", "German", "French", "Spanish"],
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "FlyFile",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://flyfile.it",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "EUR",
          lowPrice: "0",
          highPrice: "20",
          offerCount: "4",
        },
      },
    ],
  };

  return (
    <html lang={locale}>
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
      <body
        className={`${inter.variable} font-sans antialiased bg-white min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
