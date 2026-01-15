import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import {
  getUsageSummary,
  getTodayUsage,
  getMonthUsage,
  getUsageRecords,
} from '@/../scripts/content-generator/utils/usage-tracker';

// GET - Get usage statistics
export async function GET(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';
  const raw = searchParams.get('raw');

  // Return raw records if requested
  if (raw === 'true') {
    const records = getUsageRecords();
    return NextResponse.json({ records });
  }

  let summary;
  switch (period) {
    case 'today':
      summary = getTodayUsage();
      break;
    case 'week':
      summary = getUsageSummary(7);
      break;
    case 'month':
    default:
      summary = getUsageSummary(30);
      break;
  }

  return NextResponse.json({ usage: summary });
}
