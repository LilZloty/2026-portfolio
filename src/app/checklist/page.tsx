import { Metadata } from 'next';
import ChecklistHero from '@/components/checklist/ChecklistHero';
import ChecklistPreview from '@/components/checklist/ChecklistPreview';

export const metadata: Metadata = {
  title: 'Free Shopify Speed Checklist | Theo Daudebourg',
  description: 'Download the free 10-point Shopify Speed Checklist. Find what\'s slowing your store in 5 minutes.',
  openGraph: {
    title: 'Free Shopify Speed Checklist',
    description: 'Find what\'s slowing your store in 5 minutes.',
    type: 'website',
  },
};

export default function ChecklistPage() {
  return (
    <main className="min-h-screen">
      <ChecklistHero />
      <ChecklistPreview />
    </main>
  );
}
