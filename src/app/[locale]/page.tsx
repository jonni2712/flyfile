import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import HomePageClient from './HomePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  const localePrefix = locale === 'it' ? '' : `/${locale}`;
  const url = `https://flyfile.it${localePrefix}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://flyfile.it${l === 'it' ? '' : `/${l}`}`;
  }

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlyFile',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },
  };
}

export default function HomePage() {
  return <HomePageClient />;
}
