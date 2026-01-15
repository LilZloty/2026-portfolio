'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const faqs = [
  {
    question: 'How is this different from running PageSpeed Insights myself?',
    answer: 'PageSpeed gives you a score and generic recommendations. I dig into your actual code, theme, apps, and images to find the specific issues affecting YOUR store. Plus, I explain it in plain English and prioritize what matters most.',
  },
  {
    question: 'What if my score is already above 80?',
    answer: 'Great! But score isn\'t everything. You might have a high score but slow LCP (Largest Contentful Paint) on mobile - the metric Google actually cares about. I audit the whole picture, not just the number.',
  },
  {
    question: 'Do you do the fixes, or just tell me what\'s wrong?',
    answer: 'The $197 audit includes 1 critical fix implemented by me. For larger fixes, I provide detailed instructions or you can hire me for the full implementation.',
  },
  {
    question: 'How long does it take?',
    answer: '48 hours from the moment I get access to your store. Usually faster. If I can\'t deliver in 48 hours, you get a full refund - no questions asked.',
  },
  {
    question: 'What do you need from me?',
    answer: 'Just your store URL and a collaborator invite to your Shopify admin (viewer access is fine). Takes 2 minutes to set up. I\'ll walk you through it.',
  },
  {
    question: 'Is there a guarantee?',
    answer: 'Yes. If you\'re not satisfied with the audit, or if I can\'t find at least 5 actionable improvements, you get 100% of your money back. No questions asked.',
  },
];

export default function SpeedAuditFAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current.querySelectorAll('.faq-item'),
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
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

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="tag tag-lime mb-4 inline-block">Questions?</span>
          <h2 className="heading-lg text-white mb-4">
            FREQUENTLY ASKED
          </h2>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item glass-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center gap-4"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-lime-neon transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-silver-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
