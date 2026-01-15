'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface CalEmbedProps {
  calLink?: string;
  className?: string;
}

export default function CalEmbed({ 
  calLink = "YOUR_USERNAME/discovery-call",
  className = ""
}: CalEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize Cal.com after script loads
    if (isLoaded && typeof window !== 'undefined' && (window as unknown as { Cal?: unknown }).Cal) {
      const Cal = (window as unknown as { Cal: (action: string, options?: Record<string, unknown>) => void }).Cal;
      Cal("init", { origin: "https://cal.com" });
      Cal("ui", {
        styles: { branding: { brandColor: "#A1FB09" } },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    }
  }, [isLoaded]);

  return (
    <div className={className}>
      <Script 
        src="https://app.cal.com/embed/embed.js"
        onLoad={() => setIsLoaded(true)}
        strategy="lazyOnload"
      />
      
      <div 
        data-cal-link={calLink}
        data-cal-config='{"layout":"month_view"}'
        className="w-full min-h-[500px] rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: 'var(--silver-900, #1a1a1a)',
        }}
      >
        {/* Loading state */}
        {!isLoaded && (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-lime-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-silver-400 text-sm">Loading calendar...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
