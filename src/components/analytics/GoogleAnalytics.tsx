'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId?: string;
}

/**
 * Google Analytics 4 Script Component
 * Add this to your layout to enable GA4 tracking
 */
export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const id = gaId || process.env.NEXT_PUBLIC_GA_ID;
  
  // Don't render if no GA ID
  if (!id) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}
