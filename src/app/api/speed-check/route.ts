import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';

interface PageSpeedResult {
  score: number;
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  speedIndex: number;
  issues: string[];
  opportunities: string[];
}

/**
 * Free Speed Check API
 * Uses Google PageSpeed Insights API to analyze a Shopify store
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - standard limit for public endpoint
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'speed-check', RATE_LIMITS.standard);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before checking another URL.' },
        { 
          status: 429,
          headers: rateLimitHeaders(rateLimit.remaining, rateLimit.resetIn),
        }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Call Google PageSpeed Insights API
    const apiKey = process.env.PAGESPEED_API_KEY;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(validUrl.toString())}&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to analyze URL' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;

    // Extract key metrics
    const result: PageSpeedResult = {
      score: Math.round((lighthouse.categories.performance?.score || 0) * 100),
      lcp: lighthouse.audits['largest-contentful-paint']?.numericValue || 0,
      fid: lighthouse.audits['max-potential-fid']?.numericValue || 0,
      cls: lighthouse.audits['cumulative-layout-shift']?.numericValue || 0,
      fcp: lighthouse.audits['first-contentful-paint']?.numericValue || 0,
      ttfb: lighthouse.audits['server-response-time']?.numericValue || 0,
      speedIndex: lighthouse.audits['speed-index']?.numericValue || 0,
      issues: extractIssues(lighthouse.audits),
      opportunities: extractOpportunities(lighthouse.audits),
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Speed check error:', error);
    return NextResponse.json(
      { error: 'An error occurred while analyzing the URL' },
      { status: 500 }
    );
  }
}

function extractIssues(audits: Record<string, { score: number; title: string }>): string[] {
  const issues: string[] = [];
  const criticalAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'unminified-css',
    'unminified-javascript',
    'offscreen-images',
    'uses-optimized-images',
    'uses-webp-images',
    'uses-text-compression',
    'uses-responsive-images',
  ];

  for (const auditId of criticalAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 0.9) {
      issues.push(audit.title);
    }
  }

  return issues.slice(0, 5); // Return top 5 issues
}

function extractOpportunities(audits: Record<string, { score: number; title: string; displayValue?: string }>): string[] {
  const opportunities: string[] = [];
  const opportunityAudits = [
    'server-response-time',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'dom-size',
    'critical-request-chains',
  ];

  for (const auditId of opportunityAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 0.9) {
      const displayValue = audit.displayValue ? ` (${audit.displayValue})` : '';
      opportunities.push(`${audit.title}${displayValue}`);
    }
  }

  return opportunities.slice(0, 3); // Return top 3 opportunities
}
