# Technical Implementation Plan: Portfolio Optimizations

> **Goal**: Adapt portfolio to support the 2026 wealth-building strategy
> **Priority**: Changes that directly support client acquisition

---

## Executive Summary

This document outlines the technical changes needed to transform the portfolio from a "showcase" site into a **client acquisition machine**. Focus is on:

1. Adding a dedicated $197 Speed Audit landing page
2. Creating lead magnet download funnel
3. Enhancing social proof section
4. Streamlining the services section

---

## Phase 1: Core Conversion Optimizations

### 1.1 Add Speed Audit Landing Page

**File**: `src/app/speed-audit/page.tsx` [NEW]

**Purpose**: Dedicated landing page for the $197 Quick Wins Audit offer

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────────┐
│  HERO: "Your Shopify Store is Bleeding Money"                  │
│  Subhead: "Get the exact fixes. 48 hours. $197."               │
│  [Get My Speed Audit] CTA                                      │
├─────────────────────────────────────────────────────────────────┤
│  WHAT YOU GET:                                                  │
│  - Full PageSpeed analysis                                      │
│  - Top 5 issues (prioritized)                                   │
│  - 45-min video walkthrough                                     │
│  - Action plan with priorities                                  │
│  - 1 critical fix included                                      │
├─────────────────────────────────────────────────────────────────┤
│  BEFORE/AFTER PROOF (Screenshots)                               │
├─────────────────────────────────────────────────────────────────┤
│  TESTIMONIALS                                                   │
├─────────────────────────────────────────────────────────────────┤
│  FAQ                                                            │
├─────────────────────────────────────────────────────────────────┤
│  [Get My Speed Audit] CTA                                       │
│  "Results in 48 hours or your money back"                       │
└─────────────────────────────────────────────────────────────────┘
```

**Code Structure**:
```typescript
// src/app/speed-audit/page.tsx
export default function SpeedAuditPage() {
  return (
    <>
      <SpeedAuditHero />
      <WhatYouGet />
      <BeforeAfterProof />
      <Testimonials />
      <SpeedAuditFAQ />
      <FinalCTA />
    </>
  );
}
```

**Integration**:
- Link from main ServicesSection "Quick Wins Audit" card
- Add to Navigation as "Speed Audit" or highlight CTA
- Add Stripe checkout integration (or Cal.com booking + manual invoicing)

---

### 1.2 Lead Magnet Funnel

**Files**:
- `src/app/checklist/page.tsx` [NEW] - Lead magnet landing page
- `src/components/ui/LeadMagnetPopup.tsx` [NEW] - Exit-intent popup
- `public/downloads/shopify-speed-checklist.pdf` [NEW] - The PDF

**Purpose**: Capture emails with free value

**Landing Page Wireframe**:
```
┌─────────────────────────────────────────────────────────────────┐
│  "The 10-Point Shopify Speed Checklist"                         │
│  "Find what's slowing your store in 5 minutes."                 │
│                                                                  │
│  [Your Email] [Get the Checklist]                               │
│                                                                  │
│  Preview of what's inside:                                       │
│  - Image optimization check                                      │
│  - App bloat analysis                                           │
│  - Theme speed test                                             │
│  - ...                                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Exit-Intent Popup**:
```typescript
// src/components/ui/LeadMagnetPopup.tsx
'use client';

import { useState, useEffect } from 'react';

export default function LeadMagnetPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !localStorage.getItem('popup_shown')) {
        setIsVisible(true);
        localStorage.setItem('popup_shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="glass-card p-8 max-w-md">
        <h3 className="heading-md text-white mb-4">
          Before you go...
        </h3>
        <p className="text-silver-400 mb-6">
          Grab the free Shopify Speed Checklist and find what's slowing your store.
        </p>
        {/* Email form */}
        <button onClick={() => setIsVisible(false)}>
          No thanks
        </button>
      </div>
    </div>
  );
}
```

**Email Integration Options**:
- ConvertKit (recommended - free up to 1K subscribers)
- Beehiiv
- Mailchimp

---

### 1.3 Enhance Social Proof Section

**File**: `src/components/sections/SocialProofSection.tsx` [MODIFY]

**Current State**: Has testimonials but may not be optimized for trust

**Enhancements**:

1. **Add Video Testimonials** (when available)
```typescript
const videoTestimonials = [
  { videoUrl: '/testimonials/client1.mp4', name: 'Client Name', store: 'Store' }
];
```

2. **Add Results Counter**
```typescript
<div className="grid grid-cols-3 gap-8 mb-12">
  <Stat number="70+" label="Stores Optimized" />
  <Stat number="92" label="Avg. PageSpeed" />
  <Stat number="25%" label="Avg. Speed Increase" />
</div>
```

3. **Add Logo Cloud** (when you have brand clients)
```typescript
<div className="flex gap-8 opacity-60">
  {clientLogos.map(logo => <img src={logo} alt="" />)}
</div>
```

---

### 1.4 Streamline Services Section

**File**: `src/components/sections/ServicesSection.tsx` [MODIFY]

**Current**: 3 tiers with multiple services each

**Optimizations**:

1. **Highlight the $197 Audit** as the clear entry point
2. **Add "Book Now" calendar links** instead of generic "Get Started"
3. **Add urgency element**: "3 spots left this week" (optional)

**Code Change**:
```typescript
// Add to starter services array
{
  icon: '00',
  title: 'FREE: Store Speed Check',
  tagline: 'See your score in 60 seconds.',
  price: 'Free',
  timeline: 'Instant',
  description: "I'll send you a quick video with your PageSpeed score and top issues. No strings.",
  features: [
    'PageSpeed score',
    'Top 3 issues identified',
    '2-min video walkthrough',
    'No obligation',
  ],
  promise: "This is how we start. Let me show you I know my stuff.",
  highlight: false,
  ctaText: 'Get Free Check',
  ctaLink: 'mailto:email@domain.com?subject=Free Speed Check&body=Store URL: ',
},
```

---

## Phase 2: Analytics & Tracking

### 2.1 Add Conversion Tracking

**Files**:
- `src/lib/analytics.ts` [NEW]
- Update `src/app/layout.tsx`

**Purpose**: Track which CTAs convert, which pages get traffic

**Implementation**:
```typescript
// src/lib/analytics.ts
export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Usage in CTA buttons:
<button onClick={() => {
  trackEvent('click', 'CTA', 'speed_audit_hero');
  scrollToContact();
}}>
  Get My Speed Audit
</button>
```

**Setup**:
1. Create Google Analytics 4 property
2. Add tracking ID to `.env.local`: `NEXT_PUBLIC_GA_ID=G-XXXXXXX`
3. Add script to layout

---

### 2.2 Add UTM Parameter Tracking

**Purpose**: Track which content/platform drives traffic

**Implementation**:
```typescript
// src/hooks/useUTMParams.ts
export function useUTMParams() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
    };
    if (utm.source) {
      sessionStorage.setItem('utm_params', JSON.stringify(utm));
    }
  }, []);
}
```

---

## Phase 3: Content System

### 3.1 Add Case Studies Section

**Files**:
- `src/app/case-studies/page.tsx` [NEW]
- `src/app/case-studies/[slug]/page.tsx` [NEW]
- `content/case-studies/` [NEW DIRECTORY]

**Purpose**: Showcase before/after results

**Structure**:
```
content/case-studies/
├── auto-parts-store.md
├── beauty-brand.md
└── food-ecommerce.md
```

**Frontmatter Format**:
```markdown
---
title: "Auto Parts Store Speed Optimization"
client: "Client Name (or Anonymous)"
industry: "Auto Parts"
resultBefore: "45"
resultAfter: "92"
metric: "PageSpeed"
timeline: "7 days"
heroImage: "/case-studies/auto-parts-hero.jpg"
---

## The Challenge
...

## The Solution
...

## The Results
...
```

---

### 3.2 Add Blog/Tips Section

**File**: `src/components/sections/BlogSection.tsx` already exists

**Enhancement**: Link to case studies and add "Tips" category

---

## Phase 4: Booking Integration

### 4.1 Add Cal.com Integration

**Purpose**: Allow clients to book calls directly

**Implementation**:
1. Create Cal.com account (free tier)
2. Set up event types:
   - "Free 15-min Discovery Call"
   - "Speed Audit Kickoff (30 min)"
   - "Strategy Session (45 min)"

3. Embed in ContactSection:
```typescript
// In ContactSection.tsx
<Cal
  calLink="yourusername/speed-audit"
  style={{ width: '100%', height: '100%' }}
/>
```

---

## Implementation Priority

| Priority | Task | Time Estimate | Impact |
|----------|------|---------------|--------|
| P0 | Speed Audit landing page | 4-6 hours | Direct revenue |
| P0 | Cal.com booking setup | 1 hour | Reduces friction |
| P1 | Lead magnet page + PDF | 3-4 hours | Email list |
| P1 | Social proof enhancements | 2-3 hours | Trust |
| P2 | Analytics setup | 2 hours | Tracking |
| P2 | Case studies system | 4-6 hours | Long-term proof |
| P3 | Exit-intent popup | 2-3 hours | Email capture |

---

## Environment Variables Needed

Add to `.env.local`:
```
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email (ConvertKit)
CONVERTKIT_API_KEY=xxx
CONVERTKIT_FORM_ID=xxx

# Cal.com (optional - if using embed)
NEXT_PUBLIC_CAL_LINK=yourusername

# Stripe (future)
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
```

---

## Testing Checklist

Before deploying each feature:

- [ ] Mobile responsive (test on real device)
- [ ] CTA buttons work and track events
- [ ] Forms submit correctly
- [ ] Email delivery works
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] SEO meta tags present

---

## Next Steps

1. **Immediate**: Set up Cal.com and add booking links
2. **This Week**: Create Speed Audit landing page
3. **Next Week**: Create PDF lead magnet and capture page
4. **Week 3**: Add analytics and tracking
5. **Ongoing**: Add case studies as you complete projects

---

*This is a living document. Update as you implement features.*
