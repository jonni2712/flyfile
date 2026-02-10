import { Metadata } from 'next';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ContattiClient from './ContattiClient';

export const metadata: Metadata = {
  title: 'Contatti',
  description:
    'Contattaci per supporto, informazioni commerciali o assistenza tecnica. Il team FlyFile è a tua disposizione.',
  alternates: { canonical: 'https://flyfile.it/contatti' },
  openGraph: {
    title: 'Contatti | FlyFile',
    description:
      'Contattaci per supporto, informazioni commerciali o assistenza tecnica.',
    url: 'https://flyfile.it/contatti',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlyFile - Contatti',
      },
    ],
  },
};

export default function ContattiPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: 'Contatti', url: 'https://flyfile.it/contatti' },
      ]} />
      <ContattiClient />
    </>
  );
}
