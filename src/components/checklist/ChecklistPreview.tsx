'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const checklistItems = [
  {
    number: '01',
    title: 'Hero Image Size',
    description: 'Is your main hero image under 200KB? Oversized images are the #1 speed killer.',
  },
  {
    number: '02',
    title: 'App Count',
    description: 'Are you running more than 10 apps? Each one adds JavaScript that slows your store.',
  },
  {
    number: '03',
    title: 'Lazy Loading',
    description: 'Are images below the fold loading lazily? They shouldn\'t load until needed.',
  },
  {
    number: '04',
    title: 'Font Loading',
    description: 'How many custom fonts are you loading? More than 2-3 can hurt performance.',
  },
  {
    number: '05',
    title: 'Third-Party Scripts',
    description: 'Review pixels, chat widgets, and tracking - each one adds load time.',
  },
];

export default function ChecklistPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (itemsRef.current) {
        const items = itemsRef.current.querySelectorAll('.checklist-item');
        gsap.fromTo(
          items,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: itemsRef.current,
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
    <section ref={sectionRef} className="py-24 px-4 md:px-8 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="tag tag-lime mb-4 inline-block">Preview</span>
          <h2 className="heading-md text-white mb-4">
            WHAT&apos;S INSIDE THE CHECKLIST
          </h2>
          <p className="text-silver-400 max-w-lg mx-auto">
            10 quick checks you can do right now. Here&apos;s a sneak peek at the first 5:
          </p>
        </div>

        {/* Checklist Items */}
        <div ref={itemsRef} className="space-y-4">
          {checklistItems.map((item) => (
            <div key={item.number} className="checklist-item glass-card p-5 flex items-start gap-4">
              <span className="text-lime-neon font-mono text-sm opacity-60 mt-1">
                {item.number}
              </span>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-silver-400 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
          
          {/* Teaser for remaining items */}
          <div className="glass-card p-5 border-dashed border-silver-700 text-center">
            <p className="text-silver-500 text-sm">
              + 5 more checks in the full checklist...
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary"
          >
            Get the Full Checklist Free
          </button>
          <p className="mt-4">
            <a href="/checklist/pdf" className="text-lime-neon hover:underline text-sm">
              Or view printable PDF version →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
