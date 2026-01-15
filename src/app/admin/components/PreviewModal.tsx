'use client';

import { useState } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  drafts: {
    blog: string;
    linkedin: string;
    twitter: string;
  };
  publishOptions: {
    blog: boolean;
    linkedin: boolean;
    twitter: boolean;
  };
  isPublishing: boolean;
}

export default function PreviewModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  drafts,
  publishOptions,
  isPublishing,
}: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'blog' | 'linkedin' | 'twitter'>('blog');

  if (!isOpen) return null;

  // Determine which tabs to show based on what's being published
  const tabs = [
    { id: 'blog' as const, label: 'Blog', enabled: publishOptions.blog },
    { id: 'linkedin' as const, label: 'LinkedIn', enabled: publishOptions.linkedin },
    { id: 'twitter' as const, label: 'Twitter', enabled: publishOptions.twitter },
  ].filter(t => t.enabled);

  // Set active tab to first available if current isn't enabled
  const currentTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id || 'blog';

  const getCharacterCount = (content: string) => content.length;
  const getWordCount = (content: string) => content.split(/\s+/).filter(w => w.length > 0).length;

  const linkedinLimit = 1200;
  const twitterLimit = 280;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded overflow-hidden"
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
              className="text-xl font-semibold"
              style={{ color: 'var(--silver-100)' }}
            >
              Preview: {title}
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--silver-500)' }}
            >
              Review your content before publishing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--silver-400)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b"
          style={{ borderColor: 'var(--silver-800)' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-6 py-3 text-sm font-medium transition-colors"
              style={{ 
                color: currentTab === tab.id ? 'var(--lime-neon)' : 'var(--silver-400)',
                borderBottom: currentTab === tab.id ? '2px solid var(--lime-neon)' : '2px solid transparent',
                background: 'transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'blog' && (
            <BlogPreview content={drafts.blog} />
          )}
          {currentTab === 'linkedin' && (
            <SocialPreview 
              content={drafts.linkedin} 
              platform="linkedin"
              characterLimit={linkedinLimit}
              characterCount={getCharacterCount(drafts.linkedin)}
            />
          )}
          {currentTab === 'twitter' && (
            <SocialPreview 
              content={drafts.twitter} 
              platform="twitter"
              characterLimit={twitterLimit}
              characterCount={getCharacterCount(drafts.twitter)}
            />
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--silver-800)' }}
        >
          <div className="text-sm" style={{ color: 'var(--silver-500)' }}>
            Publishing to: {tabs.map(t => t.label).join(', ')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isPublishing}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPublishing}
              className="btn-primary flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm & Publish
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Blog Preview - Renders markdown-like formatting
function BlogPreview({ content }: { content: string }) {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  // Simple markdown rendering for preview
  const renderContent = () => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Frontmatter
      if (line === '---') {
        return <hr key={i} className="my-4 border-silver-700" />;
      }
      // H2
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--silver-100)' }}>
            {line.replace('## ', '')}
          </h2>
        );
      }
      // H3
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--silver-200)' }}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 mb-1" style={{ color: 'var(--silver-300)' }}>
            {line.replace('- ', '')}
          </li>
        );
      }
      // Frontmatter key-value
      if (line.includes(':') && !line.startsWith('http')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        return (
          <div key={i} className="text-sm mb-1">
            <span style={{ color: 'var(--lime-neon)' }}>{key}:</span>
            <span style={{ color: 'var(--silver-400)' }}> {value}</span>
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={i} className="h-4" />;
      }
      // Regular paragraph
      return (
        <p key={i} className="mb-3 leading-relaxed" style={{ color: 'var(--silver-300)' }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span 
          className="text-xs px-2 py-1 rounded"
          style={{ background: 'var(--silver-800)', color: 'var(--silver-400)' }}
        >
          {wordCount} words
        </span>
        {wordCount < 100 && (
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            Warning: Content too short (min 100 words)
          </span>
        )}
        {wordCount > 2000 && (
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            Warning: Content too long (max 2000 words)
          </span>
        )}
      </div>
      <div 
        className="p-6 rounded font-mono text-sm leading-relaxed"
        style={{ background: 'var(--silver-950)' }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

// Social Preview - LinkedIn/Twitter format
function SocialPreview({ 
  content, 
  platform,
  characterLimit,
  characterCount 
}: { 
  content: string;
  platform: 'linkedin' | 'twitter';
  characterLimit: number;
  characterCount: number;
}) {
  const isOverLimit = characterCount > characterLimit;
  const percentage = Math.min((characterCount / characterLimit) * 100, 100);
  
  return (
    <div>
      {/* Character counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span 
            className="text-xs px-2 py-1 rounded capitalize"
            style={{ 
              background: platform === 'linkedin' ? 'rgba(0, 119, 181, 0.2)' : 'rgba(29, 161, 242, 0.2)',
              color: platform === 'linkedin' ? '#0077b5' : '#1da1f2'
            }}
          >
            {platform}
          </span>
          <span 
            className="text-xs"
            style={{ 
              color: isOverLimit ? '#ef4444' : 'var(--silver-400)'
            }}
          >
            {characterCount} / {characterLimit} characters
          </span>
        </div>
        {isOverLimit && (
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            {characterCount - characterLimit} characters over limit
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div 
        className="h-1 rounded-full mb-4 overflow-hidden"
        style={{ background: 'var(--silver-800)' }}
      >
        <div 
          className="h-full transition-all"
          style={{ 
            width: `${percentage}%`,
            background: isOverLimit ? '#ef4444' : percentage > 90 ? '#f59e0b' : 'var(--lime-neon)'
          }}
        />
      </div>

      {/* Content preview */}
      <div 
        className="p-6 rounded"
        style={{ background: 'var(--silver-950)' }}
      >
        <div 
          className="whitespace-pre-wrap leading-relaxed"
          style={{ color: 'var(--silver-200)' }}
        >
          {content || (
            <span style={{ color: 'var(--silver-600)', fontStyle: 'italic' }}>
              Content will be AI-generated when you publish
            </span>
          )}
        </div>
      </div>

      {/* Platform-specific tips */}
      <div 
        className="mt-4 p-3 rounded text-xs"
        style={{ background: 'var(--silver-800)', color: 'var(--silver-400)' }}
      >
        {platform === 'linkedin' ? (
          <p>Tip: LinkedIn shows first 3 lines before "see more". Make your hook compelling.</p>
        ) : (
          <p>Tip: Tweets perform better with a clear opinion or surprising stat.</p>
        )}
      </div>
    </div>
  );
}
