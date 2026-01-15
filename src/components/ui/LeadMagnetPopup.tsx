'use client';

import { useState, useEffect } from 'react';

export default function LeadMagnetPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Don't show if already shown or if on checklist page
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('popup_shown')) return;
    if (window.location.pathname === '/checklist') return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top of the viewport
      if (e.clientY < 10) {
        setIsVisible(true);
        localStorage.setItem('popup_shown', 'true');
      }
    };

    // Add small delay before listening to avoid immediate triggers
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Integrate with ConvertKit/email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Auto-close after success
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card p-8 max-w-md w-full animate-in border-lime-neon/30">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-silver-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4 text-lime-neon">✓</div>
            <h3 className="text-xl font-semibold text-white mb-2">You&apos;re In!</h3>
            <p className="text-silver-400 text-sm">
              Check your inbox for the checklist.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="tag tag-lime mb-3 inline-block">Before you go...</span>
              <h3 className="heading-md text-white mb-2">
                FREE SPEED CHECKLIST
              </h3>
              <p className="text-silver-400 text-sm">
                Find what&apos;s slowing your Shopify store in 5 minutes. 10 quick checks you can do right now.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-silver-900 border border-silver-700 rounded text-white placeholder-silver-500 focus:border-lime-neon focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Get the Free Checklist'}
              </button>
            </form>

            <p className="text-silver-600 text-xs text-center mt-4">
              No spam. Unsubscribe anytime.
            </p>

            {/* Alternative */}
            <div className="text-center mt-6 pt-4 border-t border-silver-800">
              <button
                onClick={handleClose}
                className="text-silver-500 text-sm hover:text-silver-300 transition-colors"
              >
                No thanks, I&apos;ll keep guessing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
