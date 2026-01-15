'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StickyCTABar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  // Don't show on Speed Audit page (already there)
  const isSpeedAuditPage = pathname === '/speed-audit';

  useEffect(() => {
    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('stickyCTADismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    const handleScroll = () => {
      // Show after scrolling 500px
      const shouldShow = window.scrollY > 500;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('stickyCTADismissed', 'true');
  };

  // Don't render if dismissed, not visible, or on speed audit page
  if (isDismissed || !isVisible || isSpeedAuditPage) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-gradient-to-r from-gray-darker via-gray-dark to-gray-darker border-t border-silver-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Message */}
          <div className="flex items-center gap-3 flex-1">
            <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full bg-lime-neon/20 text-lime-neon text-sm font-bold">
              ⚡
            </span>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                <span className="hidden sm:inline">Your Shopify store could be faster. </span>
                Get a full speed audit in 48h.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/speed-audit"
              className="btn-primary text-sm whitespace-nowrap"
            >
              Get Speed Audit - $197
            </Link>
            
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="p-2 text-silver-500 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
