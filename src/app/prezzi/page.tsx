import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Prezzi e Piani - FlyFile',
  description:
    'Scopri i piani di FlyFile: Free, Starter, Pro e Business. Condivisione file sicura con crittografia AES-256, a partire da 0 euro.',
  openGraph: {
    title: 'Prezzi e Piani - FlyFile',
    description:
      'Scopri i piani di FlyFile: Free, Starter, Pro e Business. Condivisione file sicura con crittografia AES-256.',
    url: 'https://flyfile.it/prezzi',
  },
};

export default function PrezziPage() {
  return (
    <MainLayout>
      <PricingContent />
    </MainLayout>
  );
}
