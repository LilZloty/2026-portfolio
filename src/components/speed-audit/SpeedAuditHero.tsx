'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SpeedAuditHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll('.animate-in');
        gsap.fromTo(
          elements,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.2,
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const scrollToBooking = () => {
    document.getElementById('speed-audit-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 md:px-8 pt-24">
      <div ref={contentRef} className="max-w-5xl mx-auto w-full text-center">
        {/* Trust Badge */}
        <div className="animate-in mb-8">
          <span className="tag tag-lime">Limited Availability</span>
        </div>

        {/* Headline */}
        <h1 className="animate-in heading-xl text-white mb-4">
          YOUR SHOPIFY STORE IS
        </h1>
        <h2 className="animate-in heading-xl text-lime-neon mb-6">
          BLEEDING MONEY
        </h2>

        {/* Subheadline */}
        <p className="animate-in text-silver-300 text-xl md:text-2xl mb-4">
          Get the exact fixes. 48 hours. <span className="text-lime-neon font-bold">$197</span>
        </p>

        <p className="animate-in text-silver-500 text-lg max-w-2xl mx-auto mb-10">
          Most "speed experts" run a PageSpeed test and call it a day. I dig deeper - finding the hidden bottlenecks that are actually costing you sales.
        </p>

        {/* CTA */}
        <div className="animate-in">
          <button onClick={scrollToBooking} className="btn-primary text-lg px-8 py-4">
            Get My Speed Audit
          </button>
          <p className="text-silver-600 text-sm mt-4">
            Results in 48 hours or your money back
          </p>
        </div>

        {/* Social Proof Mini */}
        <div className="animate-in flex justify-center items-center gap-8 mt-16 text-center">
          <div>
            <p className="text-2xl font-mono font-bold text-lime-neon">70+</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider">Stores Audited</p>
          </div>
          <div className="w-px h-8 bg-silver-800" />
          <div>
            <p className="text-2xl font-mono font-bold text-white">92</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider">Avg. PageSpeed</p>
          </div>
          <div className="w-px h-8 bg-silver-800" />
          <div>
            <p className="text-2xl font-mono font-bold text-white">48h</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider">Turnaround</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button onClick={() => document.getElementById('what-you-get')?.scrollIntoView({ behavior: 'smooth' })} className="text-silver-600 hover:text-lime-neon transition-colors">
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
