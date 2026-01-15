'use client';

import { useState } from 'react';
import SpeedCheckForm from './SpeedCheckForm';
import SpeedCheckResults from './SpeedCheckResults';
import analytics from '@/lib/analytics';

export interface SpeedCheckResult {
  score: number;
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  speedIndex: number;
  issues: string[];
  opportunities: string[];
}

export default function SpeedCheckTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeedCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<string>('');

  const handleCheck = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedUrl(url);

    try {
      const response = await fetch('/api/speed-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze URL');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setAnalyzedUrl('');
  };

  return (
    <div className="w-full">
      {!result ? (
        <SpeedCheckForm
          onSubmit={handleCheck}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <SpeedCheckResults
          result={result}
          url={analyzedUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
