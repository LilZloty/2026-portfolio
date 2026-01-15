/**
 * Content Performance Analytics
 * Tracks blog views, social engagement, and content metrics
 */
import * as fs from 'fs';
import * as path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'content', 'analytics.json');

export interface ContentMetrics {
  contentId: string; // slug or file path
  title: string;
  type: 'blog' | 'linkedin' | 'twitter';
  publishedAt: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    impressions?: number;
  };
  lastUpdated: string;
}

export interface AnalyticsData {
  contents: ContentMetrics[];
  lastSync: string;
}

/**
 * Get all analytics data
 */
export function getAnalytics(): AnalyticsData {
  if (!fs.existsSync(ANALYTICS_FILE)) {
    return { contents: [], lastSync: new Date().toISOString() };
  }
  try {
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics file:', error);
    return { contents: [], lastSync: new Date().toISOString() };
  }
}

/**
 * Save analytics data
 */
function saveAnalytics(data: AnalyticsData): void {
  const dir = path.dirname(ANALYTICS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  data.lastSync = new Date().toISOString();
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Record or update content metrics
 */
export function recordMetrics(
  contentId: string,
  title: string,
  type: ContentMetrics['type'],
  metrics: Partial<ContentMetrics['metrics']>,
  publishedAt?: string
): ContentMetrics {
  const data = getAnalytics();
  const existingIndex = data.contents.findIndex(c => c.contentId === contentId);
  
  if (existingIndex >= 0) {
    // Update existing
    const existing = data.contents[existingIndex];
    data.contents[existingIndex] = {
      ...existing,
      metrics: { ...existing.metrics, ...metrics },
      lastUpdated: new Date().toISOString(),
    };
    saveAnalytics(data);
    return data.contents[existingIndex];
  } else {
    // Create new
    const newContent: ContentMetrics = {
      contentId,
      title,
      type,
      publishedAt: publishedAt || new Date().toISOString(),
      metrics,
      lastUpdated: new Date().toISOString(),
    };
    data.contents.push(newContent);
    saveAnalytics(data);
    return newContent;
  }
}

/**
 * Increment a specific metric (e.g., views)
 */
export function incrementMetric(
  contentId: string,
  metric: keyof ContentMetrics['metrics'],
  amount: number = 1
): ContentMetrics | null {
  const data = getAnalytics();
  const content = data.contents.find(c => c.contentId === contentId);
  
  if (!content) return null;
  
  const currentValue = content.metrics[metric] || 0;
  content.metrics[metric] = currentValue + amount;
  content.lastUpdated = new Date().toISOString();
  
  saveAnalytics(data);
  return content;
}

/**
 * Get top performing content
 */
export function getTopContent(
  metric: keyof ContentMetrics['metrics'] = 'views',
  limit: number = 10,
  type?: ContentMetrics['type']
): ContentMetrics[] {
  const data = getAnalytics();
  let filtered = data.contents;
  
  if (type) {
    filtered = filtered.filter(c => c.type === type);
  }
  
  return filtered
    .filter(c => c.metrics[metric] !== undefined)
    .sort((a, b) => (b.metrics[metric] || 0) - (a.metrics[metric] || 0))
    .slice(0, limit);
}

/**
 * Get content by type
 */
export function getContentByType(type: ContentMetrics['type']): ContentMetrics[] {
  const data = getAnalytics();
  return data.contents.filter(c => c.type === type);
}

/**
 * Get aggregate stats
 */
export function getAggregateStats(): {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  byType: Record<string, { count: number; views: number }>;
} {
  const data = getAnalytics();
  
  const stats = {
    totalContent: data.contents.length,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    byType: {} as Record<string, { count: number; views: number }>,
  };
  
  for (const content of data.contents) {
    stats.totalViews += content.metrics.views || 0;
    stats.totalLikes += content.metrics.likes || 0;
    stats.totalComments += content.metrics.comments || 0;
    
    if (!stats.byType[content.type]) {
      stats.byType[content.type] = { count: 0, views: 0 };
    }
    stats.byType[content.type].count++;
    stats.byType[content.type].views += content.metrics.views || 0;
  }
  
  return stats;
}

/**
 * Get recent content performance
 */
export function getRecentPerformance(days: number = 30): ContentMetrics[] {
  const data = getAnalytics();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return data.contents
    .filter(c => new Date(c.publishedAt) >= cutoff)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
