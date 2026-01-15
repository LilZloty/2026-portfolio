'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const examples = [
  {
    name: 'Fashion Store',
    before: { score: 38, loadTime: '6.2s' },
    after: { score: 94, loadTime: '1.4s' },
    impact: '+42% mobile conversions',
  },
  {
    name: 'Auto Parts',
    before: { score: 45, loadTime: '5.1s' },
    after: { score: 91, loadTime: '1.8s' },
    impact: '+28% page views per session',
  },
  {
    name: 'Beauty Brand',
    before: { score: 52, loadTime: '4.8s' },
    after: { score: 89, loadTime: '2.1s' },
    impact: '-35% bounce rate',
  },
];

export default function BeforeAfterProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.proof-card');
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8 relative bg-silver-950/50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="tag tag-lime mb-4 inline-block">Real Results</span>
          <h2 className="heading-lg text-white mb-4">
            BEFORE & AFTER
          </h2>
          <p className="text-silver-400 text-lg max-w-2xl mx-auto">
            These are actual client results. Names changed for privacy.
          </p>
        </div>

        {/* Results Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {examples.map((example) => (
            <div key={example.name} className="proof-card glass-card p-6">
              <h3 className="text-white font-semibold mb-6">{example.name}</h3>
              
              {/* Before/After Scores */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <p className="text-silver-500 text-xs uppercase mb-2">Before</p>
                  <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center">
                    <span className="text-red-400 font-mono text-xl font-bold">{example.before.score}</span>
                  </div>
                  <p className="text-silver-600 text-xs mt-2">{example.before.loadTime}</p>
                </div>
                
                <svg className="w-8 h-8 text-lime-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                
                <div className="text-center">
                  <p className="text-lime-neon text-xs uppercase mb-2">After</p>
                  <div className="w-16 h-16 rounded-full border-2 border-lime-neon flex items-center justify-center">
                    <span className="text-lime-neon font-mono text-xl font-bold">{example.after.score}</span>
                  </div>
                  <p className="text-lime-neon/60 text-xs mt-2">{example.after.loadTime}</p>
                </div>
              </div>
              
              {/* Impact */}
              <div className="border-t border-silver-800 pt-4">
                <p className="text-center text-sm">
                  <span className="text-lime-neon font-semibold">{example.impact}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
