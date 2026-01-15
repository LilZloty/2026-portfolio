'use client';

import { useEffect } from 'react';

interface UTMParams {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
}

/**
 * Hook to capture and store UTM parameters from URL
 * Stores in sessionStorage for attribution throughout the session
 */
export function useUTMParams() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const utm: UTMParams = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      term: params.get('utm_term'),
      content: params.get('utm_content'),
    };

    // Only store if at least one UTM param is present
    if (utm.source || utm.medium || utm.campaign) {
      sessionStorage.setItem('utm_params', JSON.stringify(utm));
      
      // Also store first touch attribution (doesn't overwrite)
      if (!localStorage.getItem('utm_first_touch')) {
        localStorage.setItem('utm_first_touch', JSON.stringify({
          ...utm,
          timestamp: new Date().toISOString(),
          landingPage: window.location.pathname,
        }));
      }
    }
  }, []);
}

/**
 * Get stored UTM parameters
 */
export function getUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem('utm_params');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get first touch attribution data
 */
export function getFirstTouchAttribution(): (UTMParams & { timestamp: string; landingPage: string }) | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('utm_first_touch');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Component to track UTM params - add to layout
 */
export function UTMTracker() {
  useUTMParams();
  return null;
}

export default useUTMParams;
