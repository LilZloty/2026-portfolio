'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { CaseStudy } from '@/lib/case-studies';

interface CaseStudyCardProps {
  study: CaseStudy;
  index: number;
}

export default function CaseStudyCard({ study, index }: CaseStudyCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const scoreRef = useRef<SVGCircleElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animate score circle on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Card entrance animation
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power3.out',
          }
        );
      }

      // Score circle animation
      if (scoreRef.current) {
        const score = parseInt(study.resultAfter) || 0;
        const circumference = 2 * Math.PI * 28;
        const dashArray = (score / 100) * circumference;

        gsap.fromTo(
          scoreRef.current,
          { strokeDasharray: '0 176' },
          {
            strokeDasharray: `${dashArray} ${circumference}`,
            duration: 1.2,
            delay: 0.3 + index * 0.1,
            ease: 'power2.out',
          }
        );
      }
    });

    return () => ctx.revert();
  }, [index, study.resultAfter]);

  // Hover animation
  useEffect(() => {
    if (!cardRef.current) return;

    if (isHovered) {
      gsap.to(cardRef.current, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isHovered]);

  const score = parseInt(study.resultAfter) || 0;
  const getScoreColor = (s: number) => {
    if (s >= 90) return '#22c55e'; // green
    if (s >= 50) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const improvement = Math.round(
    ((parseInt(study.resultAfter) - parseInt(study.resultBefore)) / 
    parseInt(study.resultBefore)) * 100
  );

  return (
    <Link
      ref={cardRef}
      href={`/case-studies/${study.slug}`}
      className="glass-card p-6 group block opacity-0 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background glow effect on hover */}
      <div 
        className={`absolute inset-0 bg-gradient-radial from-lime-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        {/* Top Row: Industry + Score Circle */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="tag text-xs mb-2 inline-block">
              {study.industry}
            </span>
            {study.featured && (
              <span className="ml-2 text-xs bg-lime-neon/20 text-lime-neon px-2 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>
          
          {/* Animated Score Circle */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="4"
                className="stroke-silver-800"
              />
              <circle
                ref={scoreRef}
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="4"
                stroke={getScoreColor(score)}
                strokeLinecap="round"
                strokeDasharray="0 176"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-lg font-mono font-bold"
                style={{ color: getScoreColor(score) }}
              >
                {study.resultAfter}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-lime-neon transition-colors">
          {study.title}
        </h2>

        {/* Description */}
        <p className="text-silver-400 text-sm mb-6 line-clamp-2">
          {study.description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 pt-4 border-t border-silver-800">
          {/* Before/After */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-silver-600 text-[10px] uppercase">Before</p>
              <p className="text-silver-500 font-mono line-through">{study.resultBefore}</p>
            </div>
            <div className="text-lime-neon">→</div>
            <div className="text-center">
              <p className="text-lime-neon text-[10px] uppercase">After</p>
              <p className="text-lime-neon font-mono font-bold">{study.resultAfter}</p>
            </div>
          </div>

          {/* Improvement Badge */}
          <div className="ml-auto flex items-center gap-2">
            <span className="bg-lime-neon/20 text-lime-neon text-xs font-mono px-2 py-1 rounded">
              +{improvement}%
            </span>
            <span className="text-silver-500 text-xs">{study.timeline}</span>
          </div>
        </div>

        {/* Services Tags */}
        {study.services && study.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {study.services.slice(0, 2).map((service) => (
              <span key={service} className="text-[10px] text-silver-500 bg-silver-900 px-2 py-0.5 rounded">
                {service}
              </span>
            ))}
          </div>
        )}

        {/* View CTA */}
        <div className="mt-4 flex items-center text-lime-neon text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View Case Study</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
