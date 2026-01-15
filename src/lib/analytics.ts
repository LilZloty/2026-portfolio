// Google Analytics 4 tracking utilities

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Track a custom event in Google Analytics
 * @param action - The action/event name (e.g., 'click', 'submit')
 * @param category - Event category (e.g., 'CTA', 'Form')
 * @param label - Optional label for more context
 * @param value - Optional numeric value
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * Track a page view (usually automatic, but useful for SPAs)
 * @param url - The page URL to track
 * @param title - The page title
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
      page_title: title,
    });
  }
};

/**
 * Track CTA button clicks
 * Common usage for conversion tracking
 */
export const trackCTA = (ctaName: string, location: string) => {
  trackEvent('click', 'CTA', `${ctaName}_${location}`);
};

/**
 * Track form submissions
 */
export const trackFormSubmit = (formName: string) => {
  trackEvent('submit', 'Form', formName);
};

/**
 * Track outbound link clicks
 */
export const trackOutboundLink = (url: string) => {
  trackEvent('click', 'Outbound Link', url);
};

// Pre-defined event helpers for common actions
export const analytics = {
  // CTA Events
  speedAuditCTA: (location: string) => trackCTA('speed_audit', location),
  checklistCTA: (location: string) => trackCTA('checklist', location),
  contactCTA: (location: string) => trackCTA('contact', location),
  bookCallCTA: (location: string) => trackCTA('book_call', location),
  
  // Form Events
  contactFormSubmit: () => trackFormSubmit('contact_form'),
  checklistFormSubmit: () => trackFormSubmit('checklist_signup'),
  popupFormSubmit: () => trackFormSubmit('exit_popup'),
  
  // Page Events
  pageView: trackPageView,
  
  // Generic
  event: trackEvent,
};

export default analytics;
