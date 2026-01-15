import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCaseStudyBySlug, getAllCaseStudySlugs } from '@/lib/case-studies';
import { CaseStudyContent } from '@/components/case-studies';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  
  if (!study) {
    return { title: 'Case Study Not Found' };
  }

  return {
    title: `${study.title} | Case Study`,
    description: study.description,
    openGraph: {
      title: study.title,
      description: study.description,
      type: 'article',
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  return <CaseStudyContent study={study} />;
}

