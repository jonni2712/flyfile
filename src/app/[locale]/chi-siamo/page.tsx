import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ChiSiamoClient from './ChiSiamoClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });

  const pathnames = routing.pathnames['/chi-siamo'];
  const canonicalLocale = locale as keyof typeof pathnames;
  const localizedPath = typeof pathnames === 'string' ? pathnames : pathnames[canonicalLocale] || pathnames.it;

  const baseUrl = 'https://flyfile.it';
  const canonicalUrl = locale === 'it' ? `${baseUrl}${localizedPath}` : `${baseUrl}/${locale}${localizedPath}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    const p = typeof pathnames === 'string' ? pathnames : pathnames[loc as keyof typeof pathnames] || pathnames.it;
    languages[loc] = loc === 'it' ? `${baseUrl}${p}` : `${baseUrl}/${loc}${p}`;
  }

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${t('title')} | FlyFile`,
      description: t('description'),
      url: canonicalUrl,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `FlyFile - ${t('title')}`,
        },
      ],
    },
  };
}

export default function ChiSiamoPage() {
  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: 'Chi Siamo', url: 'https://flyfile.it/chi-siamo' },
      ]} />
      <ChiSiamoClient />
    </MainLayout>
  );
}
