'use client';

import { useState } from 'react';

interface SpeedCheckFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function SpeedCheckForm({ onSubmit, isLoading, error }: SpeedCheckFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="glass-card p-8 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <span className="tag tag-lime mb-3 inline-block">Free Tool</span>
        <h3 className="heading-md text-white mb-2">
          CHECK YOUR STORE SPEED
        </h3>
        <p className="text-silver-400 text-sm">
          Get your PageSpeed score and top issues in 30 seconds. No email required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourstore.com or https://yourstore.com"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-silver-900 border border-silver-700 rounded text-white placeholder-silver-500 focus:border-lime-neon focus:outline-none disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing... (30-60 sec)
            </>
          ) : (
            'Check My Speed'
          )}
        </button>
      </form>

      <p className="text-silver-600 text-xs text-center mt-4">
        Powered by Google PageSpeed Insights
      </p>
    </div>
  );
}
