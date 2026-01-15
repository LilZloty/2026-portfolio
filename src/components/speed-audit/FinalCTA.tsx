'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current.querySelectorAll('.animate-in'),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleBooking = () => {
    // Open Cal.com booking link - replace YOUR_USERNAME with actual username
    window.open('https://cal.com/YOUR_USERNAME/speed-audit', '_blank');
  };

  return (
    <section
      id="speed-audit-cta"
      ref={sectionRef}
      className="py-24 px-4 md:px-8 relative bg-gradient-to-b from-silver-950 to-silver-950/50"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Main CTA Box */}
        <div className="glass-card p-8 md:p-12 border-lime-neon/30">
          <h2 className="animate-in heading-lg text-white mb-4">
            READY TO STOP LOSING SALES?
          </h2>
          
          <p className="animate-in text-silver-400 text-lg mb-8 max-w-xl mx-auto">
            Get your personalized speed audit and start fixing what's actually costing you money.
          </p>

          {/* Price */}
          <div className="animate-in mb-8">
            <p className="text-silver-500 text-sm mb-2">One-time investment</p>
            <p className="text-4xl font-mono font-bold text-lime-neon">$197</p>
          </div>

          {/* CTA Button */}
          <div className="animate-in">
            <button onClick={handleBooking} className="btn-primary text-lg px-10 py-4 mb-4">
              Get My Speed Audit Now
            </button>
            <p className="text-silver-600 text-sm">
              48-hour turnaround • Money-back guarantee • 1 fix included
            </p>
          </div>

          {/* Trust Elements */}
          <div className="animate-in flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-silver-800">
            <div className="flex items-center gap-2 text-silver-500 text-sm">
              <svg className="w-5 h-5 text-lime-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>70+ stores audited</span>
            </div>
            <div className="flex items-center gap-2 text-silver-500 text-sm">
              <svg className="w-5 h-5 text-lime-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>100% satisfaction guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-silver-500 text-sm">
              <svg className="w-5 h-5 text-lime-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </div>

        {/* Alternative */}
        <p className="animate-in text-silver-600 text-sm mt-8">
          Not ready yet? <a href="/" className="text-lime-neon hover:underline">Check out my other services</a> or <a href="mailto:theo@theodaudebourg.com" className="text-lime-neon hover:underline">send me a question</a>.
        </p>
      </div>
    </section>
  );
}
