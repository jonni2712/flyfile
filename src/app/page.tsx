import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'FlyFile — Invia File Online Gratis, Sicuro e Veloce',
  description:
    'Invia file online gratis fino a 5GB con crittografia AES-256. Trasferimento file sicuro, senza registrazione. La migliore alternativa italiana a WeTransfer.',
  keywords: [
    'invia file online',
    'invia file online gratis',
    'inviare file grandi',
    'trasferimento file online',
    'trasferimenti file online',
    'trasferire file grandi',
    'condivisione file sicura',
    'condividere file online',
    'file sharing sicuro',
    'file transfer gratis',
    'inviare file pesanti gratis',
    'mandare file grandi',
    'alternativa WeTransfer',
    'WeTransfer italiano',
    'invio file crittografato',
    'crittografia AES-256',
  ],
  alternates: { canonical: 'https://flyfile.it' },
  openGraph: {
    title: 'FlyFile — Invia File Online Gratis, Sicuro e Veloce',
    description:
      'Invia file online gratis fino a 5GB con crittografia AES-256. Senza registrazione.',
    url: 'https://flyfile.it',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlyFile - Invia File Online Sicuro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlyFile — Invia File Online Gratis',
    description:
      'Trasferimento file online sicuro con crittografia AES-256. Gratis, senza registrazione.',
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
