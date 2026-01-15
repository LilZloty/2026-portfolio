'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const deliverables = [
  {
    icon: '01',
    title: 'Full Speed Analysis',
    description: 'Deep-dive into Core Web Vitals with the top 5 issues prioritized by impact. Not a 50-item checklist.',
  },
  {
    icon: '02',
    title: '45-Min Video Walkthrough',
    description: 'Screen recording showing exactly what\'s wrong and how to fix it. No jargon, just clarity.',
  },
  {
    icon: '03',
    title: 'Action Plan + 1 Fix Included',
    description: 'Prioritized roadmap with timelines. Plus, I fix the #1 issue for you right there.',
  },
];

export default function WhatYouGet() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.deliverable-card');
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
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
    <section id="what-you-get" ref={sectionRef} className="py-24 px-4 md:px-8 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="tag tag-lime mb-4 inline-block">What You Get</span>
          <h2 className="heading-lg text-white mb-4">
            EVERYTHING YOU NEED TO FIX YOUR SPEED
          </h2>
          <p className="text-silver-400 text-lg max-w-2xl mx-auto">
            No fluff. No generic advice. Just actionable insights specific to your store.
          </p>
        </div>

        {/* Deliverables Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item) => (
            <div key={item.icon} className="deliverable-card glass-card p-6 group">
              <div className="flex items-start gap-4">
                <span className="text-lime-neon font-mono text-sm opacity-60">
                  {item.icon}
                </span>
                <div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-lime-neon transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-silver-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Value Callout */}
        <div className="mt-12 text-center">
          <div className="inline-block glass-card px-8 py-4">
            <p className="text-silver-400 text-sm">
              Most agencies charge <span className="line-through text-silver-600">$500-$1,000</span> for this.
            </p>
            <p className="text-white text-lg font-semibold mt-1">
              You get it for <span className="text-lime-neon">$197</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
