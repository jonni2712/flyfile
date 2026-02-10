import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ChiSiamoClient from './ChiSiamoClient';

export const metadata: Metadata = {
  title: 'Chi Siamo',
  description:
    'Scopri chi è FlyFile: la piattaforma italiana per la condivisione file sicura con crittografia AES-256. Nata a Milano, pensata per professionisti e team.',
  alternates: { canonical: 'https://flyfile.it/chi-siamo' },
  openGraph: {
    title: 'Chi Siamo | FlyFile',
    description:
      'Scopri chi è FlyFile: piattaforma italiana per la condivisione file sicura.',
    url: 'https://flyfile.it/chi-siamo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlyFile - Chi Siamo',
      },
    ],
  },
};

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
