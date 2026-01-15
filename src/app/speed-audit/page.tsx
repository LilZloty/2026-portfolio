import { Metadata } from 'next';
import {
  SpeedAuditHero,
  WhatYouGet,
  BeforeAfterProof,
  SpeedAuditFAQ,
  FinalCTA,
} from '@/components/speed-audit';

export const metadata: Metadata = {
  title: 'Speed Audit | Theo Daudebourg',
  description: 'Get your Shopify store speed audit in 48 hours. Find exactly what\'s slowing you down and costing you sales. $197 with money-back guarantee.',
  openGraph: {
    title: 'Speed Audit | Theo Daudebourg',
    description: 'Get your Shopify store speed audit in 48 hours. Find exactly what\'s slowing you down.',
    type: 'website',
  },
};

export default function SpeedAuditPage() {
  return (
    <main className="min-h-screen">
      <SpeedAuditHero />
      <WhatYouGet />
      <BeforeAfterProof />
      <SpeedAuditFAQ />
      <FinalCTA />
    </main>
  );
}
