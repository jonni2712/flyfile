import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import BrandedLandingClient from './BrandedLandingClient';

export default async function BrandedLandingPage() {
  const headersList = await headers();
  const slug = headersList.get('x-branded-slug');

  // If no slug in header, this page was accessed directly (not via subdomain)
  if (!slug) {
    notFound();
  }

  return <BrandedLandingClient slug={slug} />;
}
