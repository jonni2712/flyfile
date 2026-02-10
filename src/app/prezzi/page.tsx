import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Prezzi e Piani',
  description:
    'Scopri i piani di FlyFile: Free, Starter, Pro e Business. Condivisione file sicura con crittografia AES-256, a partire da 0 euro.',
  alternates: { canonical: 'https://flyfile.it/prezzi' },
  openGraph: {
    title: 'Prezzi e Piani | FlyFile',
    description:
      'Scopri i piani di FlyFile: Free, Starter, Pro e Business. Condivisione file sicura con crittografia AES-256.',
    url: 'https://flyfile.it/prezzi',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlyFile - Prezzi e Piani' }],
  },
};

export default function PrezziPage() {
  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: 'Prezzi', url: 'https://flyfile.it/prezzi' },
      ]} />
      <PricingContent />
    </MainLayout>
  );
}
