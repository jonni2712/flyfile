import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/context/AuthContext";
import { TransferProvider } from "@/context/TransferContext";
import { TeamProvider } from "@/context/TeamContext";
import CookieBanner from "@/components/CookieBanner";
import ConsentScripts from "@/components/ConsentScripts";
import ToastContainer from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
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
        <ConsentScripts />
      </body>
    </html>
  );
}
