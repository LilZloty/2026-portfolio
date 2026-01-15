'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedScoreProps {
  before: number;
  after: number;
  metric: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AnimatedScore({ before, after, metric, size = 'md' }: AnimatedScoreProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const improvementRef = useRef<HTMLSpanElement>(null);

  const sizeConfig = {
    sm: { container: 'w-20 h-20', radius: 32, strokeWidth: 4, fontSize: 'text-xl' },
    md: { container: 'w-28 h-28', radius: 48, strokeWidth: 5, fontSize: 'text-3xl' },
    lg: { container: 'w-36 h-36', radius: 60, strokeWidth: 6, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const improvement = Math.round(((after - before) / before) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Animate circle
      if (circleRef.current) {
        const dashArray = (after / 100) * circumference;
        gsap.fromTo(
          circleRef.current,
          { strokeDasharray: `0 ${circumference}` },
          {
            strokeDasharray: `${dashArray} ${circumference}`,
            duration: 1.5,
            ease: 'power2.out',
          }
        );
      }

      // Animate score counter
      if (afterRef.current) {
        gsap.fromTo(
          { value: 0 },
          { value: after },
          {
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: function() {
              if (afterRef.current) {
                afterRef.current.textContent = Math.round(this.targets()[0].value).toString();
              }
            },
          }
        );
      }

      // Animate improvement
      if (improvementRef.current) {
        gsap.fromTo(
          improvementRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, delay: 1, ease: 'back.out(1.7)' }
        );
      }
    });

    return () => ctx.revert();
  }, [after, circumference]);

  return (
    <div className="flex flex-col items-center">
      <div className={`${config.container} relative`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={config.radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            className="stroke-silver-800"
          />
          <circle
            ref={circleRef}
            cx="50%"
            cy="50%"
            r={config.radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            stroke={getScoreColor(after)}
            strokeLinecap="round"
            strokeDasharray={`0 ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            ref={afterRef}
            className={`${config.fontSize} font-mono font-bold`}
            style={{ color: getScoreColor(after) }}
          >
            0
          </span>
          <span className="text-silver-500 text-[10px] uppercase">{metric}</span>
        </div>
      </div>

      {/* Improvement Badge */}
      <span 
        ref={improvementRef}
        className="mt-3 bg-lime-neon/20 text-lime-neon text-sm font-mono px-3 py-1 rounded-full"
      >
        +{improvement}%
      </span>

      {/* Before value */}
      <p className="text-silver-500 text-xs mt-2">
        <span className="line-through">{before}</span> → {after}
      </p>
    </div>
  );
}
