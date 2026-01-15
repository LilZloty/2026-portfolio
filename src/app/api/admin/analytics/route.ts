import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import {
  getAnalytics,
  recordMetrics,
  incrementMetric,
  getTopContent,
  getAggregateStats,
  getRecentPerformance,
  ContentMetrics,
} from '@/../scripts/content-generator/utils/analytics';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'summary';
  const type = searchParams.get('type') as ContentMetrics['type'] | null;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const days = parseInt(searchParams.get('days') || '30', 10);

  switch (view) {
    case 'top':
      const metric = searchParams.get('metric') as keyof ContentMetrics['metrics'] || 'views';
      return NextResponse.json({ 
        top: getTopContent(metric, limit, type || undefined) 
      });
      
    case 'recent':
      return NextResponse.json({ 
        recent: getRecentPerformance(days) 
      });
      
    case 'all':
      return NextResponse.json(getAnalytics());
      
    case 'summary':
    default:
      return NextResponse.json({ 
        stats: getAggregateStats() 
      });
  }
}

// POST - Record metrics for content
export async function POST(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { contentId, title, type, metrics, publishedAt } = body;

    if (!contentId || !title || !type) {
      return NextResponse.json(
        { error: 'contentId, title, and type are required' },
        { status: 400 }
      );
    }

    const content = recordMetrics(contentId, title, type, metrics || {}, publishedAt);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record metrics' },
      { status: 500 }
    );
  }
}

// PUT - Increment a single metric
export async function PUT(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { contentId, metric, amount = 1 } = body;

    if (!contentId || !metric) {
      return NextResponse.json(
        { error: 'contentId and metric are required' },
        { status: 400 }
      );
    }

    const content = incrementMetric(contentId, metric, amount);
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Analytics PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to increment metric' },
      { status: 500 }
    );
  }
}
