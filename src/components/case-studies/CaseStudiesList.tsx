'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { CaseStudy } from '@/lib/case-studies';
import { CaseStudyCard } from '@/components/case-studies';

interface CaseStudiesListProps {
  caseStudies: CaseStudy[];
}

export default function CaseStudiesList({ caseStudies }: CaseStudiesListProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current) {
        const elements = headerRef.current.children;
        gsap.fromTo(
          elements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }

      // Stats animation
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.3,
            ease: 'back.out(1.7)',
          }
        );
      }

      // CTA animation
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.8,
            ease: 'power3.out',
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Calculate aggregate stats
  const avgImprovement = caseStudies.length > 0
    ? Math.round(
        caseStudies.reduce((sum, s) => {
          const before = parseInt(s.resultBefore) || 1;
          const after = parseInt(s.resultAfter) || 0;
          return sum + ((after - before) / before) * 100;
        }, 0) / caseStudies.length
      )
    : 0;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-10">
          <span className="tag tag-lime mb-4 inline-block">Case Studies</span>
          <h1 className="heading-lg text-white mb-4">
            REAL STORES. REAL RESULTS.
          </h1>
          <p className="text-silver-400 max-w-2xl mx-auto">
            Not theory. Not promises. Actual before/after results from stores I&apos;ve worked with.
          </p>
        </div>

        {/* Stats Bar */}
        <div ref={statsRef} className="flex flex-wrap justify-center gap-8 md:gap-16 mb-14 py-6 border-y border-silver-800">
          <div className="text-center">
            <p className="text-3xl font-mono font-bold text-lime-neon">{caseStudies.length}</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider mt-1">Case Studies</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-mono font-bold text-white">+{avgImprovement}%</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider mt-1">Avg. Improvement</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-mono font-bold text-white">92</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider mt-1">Avg. Final Score</p>
          </div>
        </div>

        {/* Case Studies Grid */}
        {caseStudies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <CaseStudyCard key={study.slug} study={study} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card">
            <p className="text-silver-400 mb-4">Case studies coming soon.</p>
            <Link href="/speed-audit" className="btn-primary">
              Get Your Store Audited
            </Link>
          </div>
        )}

        {/* CTA */}
        <div ref={ctaRef} className="text-center mt-16 glass-card p-10 opacity-0">
          <h2 className="heading-md text-white mb-4">
            WANT TO BE MY NEXT SUCCESS STORY?
          </h2>
          <p className="text-silver-400 mb-6 max-w-lg mx-auto">
            Let&apos;s find out what&apos;s holding your store back and fix it together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/speed-audit" className="btn-primary">
              Get Your Speed Audit - $197
            </Link>
            <Link href="/speed-check" className="btn-secondary">
              Free Speed Check
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
