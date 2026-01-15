'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function ChecklistHero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Integrate with ConvertKit/email service
    // For now, simulate submission and trigger download
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Trigger download (when PDF is available)
    // window.open('/downloads/shopify-speed-checklist.pdf', '_blank');
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 md:px-8 pt-24">
      <div ref={contentRef} className="max-w-3xl mx-auto w-full text-center">
        {/* Badge */}
        <div className="animate-in mb-6">
          <span className="tag tag-lime">Free Download</span>
        </div>

        {/* Headline */}
        <h1 className="animate-in heading-lg text-white mb-4">
          THE 10-POINT SHOPIFY
        </h1>
        <h2 className="animate-in heading-lg text-lime-neon mb-6">
          SPEED CHECKLIST
        </h2>

        {/* Subheadline */}
        <p className="animate-in text-silver-300 text-lg max-w-xl mx-auto mb-10">
          Find what&apos;s slowing your store in 5 minutes. No tools needed. No technical knowledge required.
        </p>

        {/* Email Form or Success */}
        {submitted ? (
          <div className="animate-in glass-card p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4 text-lime-neon">✓</div>
            <h3 className="text-xl font-semibold text-white mb-2">Check Your Inbox!</h3>
            <p className="text-silver-400 text-sm mb-4">
              Your checklist is on its way. If you don&apos;t see it in a few minutes, check your spam folder.
            </p>
            <a href="/speed-audit" className="btn-secondary inline-block">
              Want Me to Do It For You? →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 bg-silver-900 border border-silver-700 rounded text-white placeholder-silver-500 focus:border-lime-neon focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6 py-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Get the Checklist'}
              </button>
            </div>
            <p className="text-silver-600 text-xs mt-3">
              No spam. Unsubscribe anytime. I&apos;ll also send you speed tips once a week.
            </p>
          </form>
        )}

        {/* Social Proof */}
        <div className="animate-in flex justify-center items-center gap-8 mt-16 text-center">
          <div>
            <p className="text-2xl font-mono font-bold text-white">500+</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider">Downloads</p>
          </div>
          <div className="w-px h-8 bg-silver-800" />
          <div>
            <p className="text-2xl font-mono font-bold text-white">5 min</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider">To Complete</p>
          </div>
          <div className="w-px h-8 bg-silver-800" />
          <div>
            <p className="text-2xl font-mono font-bold text-lime-neon">Free</p>
            <p className="text-xs text-silver-500 uppercase tracking-wider">Forever</p>
          </div>
        </div>
      </div>
    </section>
  );
}
