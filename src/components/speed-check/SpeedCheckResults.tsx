'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SpeedCheckResult } from './SpeedCheckTool';

interface SpeedCheckResultsProps {
  result: SpeedCheckResult;
  url: string;
  onReset: () => void;
}

export default function SpeedCheckResults({ result, url, onReset }: SpeedCheckResultsProps) {
  const [email, setEmail] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  const formatTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Store email (would integrate with ConvertKit here)
    try {
      localStorage.setItem('speedCheckEmail', email);
      localStorage.setItem('speedCheckUnlocked', 'true');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsUnlocked(true);
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if already unlocked on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const unlocked = localStorage.getItem('speedCheckUnlocked');
      if (unlocked) setIsUnlocked(true);
    }
  });

  const hasIssues = result.issues.length > 0 || result.opportunities.length > 0;

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="tag tag-lime mb-3 inline-block">Results</span>
        <p className="text-silver-400 text-sm truncate max-w-md mx-auto">
          {url}
        </p>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-silver-800"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(result.score / 100) * 352} 352`}
              className={getScoreColor(result.score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-mono font-bold ${getScoreColor(result.score)}`}>
              {result.score}
            </span>
            <span className="text-silver-500 text-xs uppercase">
              {getScoreLabel(result.score)}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison with average */}
      <div className="text-center mb-8 p-4 bg-silver-900/50 rounded-lg">
        <p className="text-silver-400 text-sm">
          Your score: <span className={`font-mono font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
          <span className="mx-3">|</span>
          Average Shopify store: <span className="font-mono font-bold text-silver-300">62</span>
        </p>
        {result.score < 62 && (
          <p className="text-red-400 text-xs mt-2">
            Your store is slower than average — you&apos;re losing sales.
          </p>
        )}
        {result.score >= 62 && result.score < 90 && (
          <p className="text-yellow-400 text-xs mt-2">
            Above average, but there&apos;s room for improvement.
          </p>
        )}
        {result.score >= 90 && (
          <p className="text-green-400 text-xs mt-2">
            Excellent! Your store is faster than most competitors.
          </p>
        )}
      </div>

      {/* Core Web Vitals - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="LCP"
          value={formatTime(result.lcp)}
          description="Largest Contentful Paint"
          isGood={result.lcp < 2500}
        />
        <MetricCard
          label="FCP"
          value={formatTime(result.fcp)}
          description="First Contentful Paint"
          isGood={result.fcp < 1800}
        />
        <MetricCard
          label="CLS"
          value={result.cls.toFixed(3)}
          description="Cumulative Layout Shift"
          isGood={result.cls < 0.1}
        />
        <MetricCard
          label="TTFB"
          value={formatTime(result.ttfb)}
          description="Time to First Byte"
          isGood={result.ttfb < 800}
        />
        <MetricCard
          label="Speed Index"
          value={formatTime(result.speedIndex)}
          description="Speed Index"
          isGood={result.speedIndex < 3400}
        />
        <MetricCard
          label="FID"
          value={formatTime(result.fid)}
          description="Max Potential FID"
          isGood={result.fid < 100}
        />
      </div>

      {/* Gated Content: Issues & Opportunities */}
      {hasIssues && !isUnlocked ? (
        <div className="mb-8">
          {/* Blurred preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-darker z-10" />
            <div className="filter blur-sm pointer-events-none">
              {result.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Issues Found ({result.issues.length})
                  </h4>
                  <ul className="space-y-1 text-silver-400 text-sm">
                    {result.issues.slice(0, 2).map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Unlock form */}
          <div className="bg-silver-900/70 rounded-lg p-6 text-center -mt-8 relative z-20">
            <div className="mb-4">
              <span className="text-2xl">🔒</span>
              <h4 className="text-white font-semibold mt-2">
                {result.issues.length + result.opportunities.length} issues found
              </h4>
              <p className="text-silver-400 text-sm mt-1">
                Enter your email to see all issues and how to fix them
              </p>
            </div>

            <form onSubmit={handleUnlock} className="max-w-sm mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-2 bg-silver-800 border border-silver-700 rounded text-white placeholder-silver-500 focus:border-lime-neon focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-sm whitespace-nowrap disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Unlock'}
                </button>
              </div>
              <p className="text-silver-600 text-xs mt-2">
                No spam. Just your speed insights.
              </p>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Issues Found - Unlocked */}
          {result.issues.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Issues Found ({result.issues.length})
              </h4>
              <ul className="space-y-2">
                {result.issues.map((issue, i) => (
                  <li key={i} className="text-silver-400 text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-1">-</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunities - Unlocked */}
          {result.opportunities.length > 0 && (
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Opportunities
              </h4>
              <ul className="space-y-2">
                {result.opportunities.map((opp, i) => (
                  <li key={i} className="text-silver-400 text-sm flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">-</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Share on Twitter */}
      <div className="text-center mb-6">
        <a
          href={`https://twitter.com/intent/tweet?text=Just%20checked%20my%20Shopify%20store%20speed%3A%20${result.score}/100%20%F0%9F%9A%80%20Check%20yours%20free%20at&url=https://theodaudebourg.com/speed-check`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-silver-400 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share your score on X
        </a>
      </div>

      {/* CTA */}
      <div className="border-t border-silver-800 pt-6">
        <p className="text-silver-400 text-sm text-center mb-4">
          Want a deeper analysis with fixes included?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/speed-audit" className="btn-primary flex-1 text-center">
            Get Full Speed Audit - $197
          </Link>
          <button onClick={onReset} className="btn-secondary flex-1">
            Check Another URL
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  isGood,
}: {
  label: string;
  value: string;
  description: string;
  isGood: boolean;
}) {
  return (
    <div className="bg-silver-900/50 rounded p-3 text-center">
      <p className="text-silver-500 text-xs uppercase mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${isGood ? 'text-green-400' : 'text-yellow-400'}`}>
        {value}
      </p>
      <p className="text-silver-600 text-[10px] mt-1">{description}</p>
    </div>
  );
}
