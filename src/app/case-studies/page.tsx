import { Metadata } from 'next';
import { getAllCaseStudies } from '@/lib/case-studies';
import CaseStudiesList from '@/components/case-studies/CaseStudiesList';

export const metadata: Metadata = {
  title: 'Case Studies | Theo Daudebourg',
  description: 'Real results from real Shopify stores. See how I\'ve helped e-commerce brands improve speed, conversions, and revenue.',
  openGraph: {
    title: 'Case Studies | Theo Daudebourg',
    description: 'Real results from real Shopify stores.',
    type: 'website',
  },
};

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return <CaseStudiesList caseStudies={caseStudies} />;
}

