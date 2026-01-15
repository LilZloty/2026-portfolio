import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  resultBefore: string;
  resultAfter: string;
  metric: string;
  timeline: string;
  heroImage?: string;
  description: string;
  date: string;
  featured?: boolean;
  content: string;
  // Additional optional fields
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  services?: string[];
}

const caseStudiesDirectory = path.join(process.cwd(), 'content', 'case-studies');

export function getAllCaseStudies(): CaseStudy[] {
  // Check if directory exists
  if (!fs.existsSync(caseStudiesDirectory)) {
    return [];
  }

  const files = fs.readdirSync(caseStudiesDirectory);
  const caseStudies = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      return getCaseStudyBySlug(slug);
    })
    .filter((study): study is CaseStudy => study !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return caseStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  try {
    const filePath = path.join(caseStudiesDirectory, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      client: data.client || 'Anonymous',
      industry: data.industry || 'E-commerce',
      resultBefore: data.resultBefore || '0',
      resultAfter: data.resultAfter || '0',
      metric: data.metric || 'PageSpeed',
      timeline: data.timeline || 'N/A',
      heroImage: data.heroImage,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      featured: data.featured || false,
      content,
      testimonial: data.testimonial,
      services: data.services || [],
    };
  } catch {
    return null;
  }
}

export function getAllCaseStudySlugs(): string[] {
  if (!fs.existsSync(caseStudiesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(caseStudiesDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

export function getFeaturedCaseStudies(limit: number = 3): CaseStudy[] {
  return getAllCaseStudies()
    .filter((study) => study.featured)
    .slice(0, limit);
}
