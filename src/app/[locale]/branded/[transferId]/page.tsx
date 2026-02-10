import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import BrandedDownloadClient from './BrandedDownloadClient';

interface PageProps {
  params: Promise<{
    transferId: string;
  }>;
}

export default async function BrandedDownloadPage({ params }: PageProps) {
  const { transferId } = await params;
  const headersList = await headers();
  const slug = headersList.get('x-branded-slug');

  // If no slug in header, this page was accessed directly (not via subdomain)
  if (!slug) {
    notFound();
  }

  return <BrandedDownloadClient transferId={transferId} slug={slug} />;
}
