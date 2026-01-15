'use client';

import { useState } from 'react';

interface RegenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (feedback: string) => Promise<void>;
  contentType: 'blog' | 'linkedin' | 'twitter';
  isRegenerating: boolean;
}

export default function RegenerateDialog({
  isOpen,
  onClose,
  onRegenerate,
  contentType,
  isRegenerating,
}: RegenerateDialogProps) {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    await onRegenerate(feedback);
    setFeedback('');
  };

  const suggestions = {
    blog: [
      'Make it shorter and more concise',
      'Add more specific metrics and numbers',
      'Make the introduction more compelling',
      'Add a stronger call-to-action',
      'Focus more on practical takeaways',
    ],
    linkedin: [
      'Make it shorter',
      'Stronger hook in first line',
      'Add a surprising stat',
      'Make it more contrarian',
      'Simpler language',
    ],
    twitter: [
      'More punchy',
      'Add a hot take angle',
      'Include a specific number',
      'Make it controversial',
    ],
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div 
        className="w-full max-w-lg rounded overflow-hidden"
        style={{ 
          background: 'var(--silver-900)',
          border: '1px solid var(--silver-700)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--silver-800)' }}
        >
          <div>
            <h2 
              className="text-lg font-semibold capitalize"
              style={{ color: 'var(--silver-100)' }}
            >
              Regenerate {contentType} Content
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--silver-500)' }}
            >
              Tell the AI how to improve it
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--silver-400)' }}
            disabled={isRegenerating}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Quick suggestions */}
          <div className="mb-4">
            <label 
              className="block text-xs mb-2"
              style={{ color: 'var(--silver-500)' }}
            >
              Quick suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions[contentType].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setFeedback(suggestion)}
                  className="text-xs px-3 py-1.5 rounded transition-colors"
                  style={{ 
                    background: 'var(--silver-800)',
                    color: 'var(--silver-300)'
                  }}
                  disabled={isRegenerating}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback input */}
          <div>
            <label 
              className="block text-xs mb-2"
              style={{ color: 'var(--silver-500)' }}
            >
              Your feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe how you'd like to improve the content..."
              className="w-full px-4 py-3 text-sm"
              style={{ 
                background: 'var(--silver-950)',
                color: 'var(--silver-200)',
                minHeight: '100px'
              }}
              disabled={isRegenerating}
            />
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-4 border-t"
          style={{ borderColor: 'var(--silver-800)' }}
        >
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isRegenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isRegenerating}
            className="btn-primary flex items-center gap-2"
          >
            {isRegenerating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Regenerating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
