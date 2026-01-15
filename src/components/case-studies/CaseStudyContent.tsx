'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CaseStudy } from '@/lib/case-studies';
import { AnimatedScore } from '@/components/case-studies';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CaseStudyContentProps {
  study: CaseStudy;
}

export default function CaseStudyContent({ study }: CaseStudyContentProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
        );
      }

      // Results card animation
      if (resultsRef.current) {
        gsap.fromTo(
          resultsRef.current,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.3, ease: 'power3.out' }
        );
      }

      // Testimonial animation
      if (testimonialRef.current) {
        gsap.fromTo(
          testimonialRef.current,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: testimonialRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Content sections animation
      if (contentRef.current) {
        const sections = contentRef.current.querySelectorAll('.content-section');
        sections.forEach((section) => {
          gsap.fromTo(
            section,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // CTA animation
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const improvement = Math.round(
    ((parseInt(study.resultAfter) - parseInt(study.resultBefore)) /
      parseInt(study.resultBefore)) *
      100
  );

  // Parse content into sections for visual separation
  const contentSections = study.content.split(/^## /gm).filter(Boolean);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 text-silver-400 hover:text-lime-neon transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Case Studies
        </Link>

        {/* Header */}
        <div ref={headerRef} className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="tag tag-lime">{study.industry}</span>
            {study.services?.map((service) => (
              <span key={service} className="tag">{service}</span>
            ))}
          </div>
          <h1 className="heading-lg text-white mb-4">{study.title}</h1>
          <p className="text-silver-400 text-lg">{study.description}</p>
        </div>

        {/* Results Summary Card */}
        <div ref={resultsRef} className="glass-card p-8 mb-10 opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Before/After Score Circle */}
            <div className="flex justify-center md:justify-start">
              <AnimatedScore
                before={parseInt(study.resultBefore)}
                after={parseInt(study.resultAfter)}
                metric={study.metric}
                size="lg"
              />
            </div>

            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Improvement"
                value={`+${improvement}%`}
                color="lime"
              />
              <StatCard
                label="Timeline"
                value={study.timeline}
                color="white"
              />
              <StatCard
                label={study.metric}
                value={study.resultAfter}
                color="lime"
              />
            </div>
          </div>
        </div>

        {/* Testimonial */}
        {study.testimonial && (
          <div
            ref={testimonialRef}
            className="glass-card p-8 mb-10 border-l-4 border-lime-neon opacity-0 relative overflow-hidden"
          >
            {/* Quote Icon Background */}
            <svg
              className="absolute -right-4 -top-4 w-24 h-24 text-lime-neon/5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            <div className="relative">
              <svg className="w-8 h-8 text-lime-neon/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-silver-300 text-lg italic mb-4">
                &quot;{study.testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime-neon/20 flex items-center justify-center">
                  <span className="text-lime-neon font-bold">
                    {study.testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{study.testimonial.author}</p>
                  <p className="text-silver-500 text-sm">{study.testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div ref={contentRef} className="space-y-10">
          {contentSections.map((section, index) => {
            const lines = section.split('\n');
            const title = lines[0]?.trim();
            const body = lines.slice(1).join('\n');

            return (
              <div key={index} className="content-section opacity-0">
                {title && (
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-lime-neon/20 flex items-center justify-center text-lime-neon text-sm font-mono">
                      {index + 1}
                    </span>
                    {title}
                  </h2>
                )}
                <div
                  className="article-prose pl-11"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(body),
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="glass-card p-8 mt-16 text-center opacity-0">
          <h2 className="heading-md text-white mb-4">
            READY FOR RESULTS LIKE THIS?
          </h2>
          <p className="text-silver-400 mb-6">
            Let&apos;s talk about what&apos;s holding your store back.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/speed-audit" className="btn-primary">
              Get Your Speed Audit
            </Link>
            <Link href="/#contact" className="btn-secondary">
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'lime' | 'white';
}) {
  return (
    <div className="bg-silver-900/50 rounded-lg p-4 text-center">
      <p className="text-silver-500 text-xs uppercase mb-1">{label}</p>
      <p
        className={`text-2xl font-mono font-bold ${
          color === 'lime' ? 'text-lime-neon' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatMarkdown(content: string): string {
  // Remove horizontal rules
  let result = content.replace(/^---+$/gm, '');
  
  // Handle tables
  const lines = result.split('\n');
  let inTable = false;
  let tableHtml = '';
  let isFirstRow = true;
  const processedLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) continue;
      
      if (!inTable) {
        inTable = true;
        tableHtml = '<table class="w-full border-collapse mb-6 text-sm">';
        isFirstRow = true;
      }
      
      const cells = trimmed.split('|').filter(Boolean);
      const tag = isFirstRow ? 'th' : 'td';
      const cls = isFirstRow 
        ? 'border border-silver-800 px-3 py-2 text-white bg-silver-900/50 font-semibold text-left'
        : 'border border-silver-800 px-3 py-2 text-silver-400';
      
      const html = cells.map(c => `<${tag} class="${cls}">${c.trim()}</${tag}>`).join('');
      
      if (isFirstRow) {
        tableHtml += `<thead><tr>${html}</tr></thead><tbody>`;
        isFirstRow = false;
      } else {
        tableHtml += `<tr>${html}</tr>`;
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody></table>';
        processedLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      processedLines.push(trimmed);
    }
  }
  
  if (inTable) {
    tableHtml += '</tbody></table>';
    processedLines.push(tableHtml);
  }
  
  result = processedLines.join('\n');
  
  return result
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/^\- (.*$)/gim, '<li class="text-silver-400 ml-4 mb-1 list-disc list-inside">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="text-silver-400 ml-4 mb-1 list-decimal list-inside">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-silver-400 mb-4">');
}
