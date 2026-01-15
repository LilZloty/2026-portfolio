/**
 * Scheduled Content Management
 * Handles draft → scheduled → published workflow
 */
import * as fs from 'fs';
import * as path from 'path';

const SCHEDULED_FILE = path.join(process.cwd(), 'content', 'scheduled.json');

export interface ScheduledContent {
  id: string;
  topicId?: string;
  title: string;
  scheduledAt: string; // ISO date string
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  platforms: {
    blog: boolean;
    linkedin: boolean;
    twitter: boolean;
  };
  content: {
    blog?: string;
    linkedin?: string;
    twitter?: string;
  };
  publishedPaths?: {
    blog?: string;
    linkedin?: string;
    twitter?: string;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all scheduled content
 */
export function getScheduledContent(): ScheduledContent[] {
  if (!fs.existsSync(SCHEDULED_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(SCHEDULED_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scheduled file:', error);
    return [];
  }
}

/**
 * Save all scheduled content
 */
export function saveScheduledContent(items: ScheduledContent[]): void {
  const dir = path.dirname(SCHEDULED_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SCHEDULED_FILE, JSON.stringify(items, null, 2));
}

/**
 * Create new scheduled content
 */
export function createScheduledContent(data: {
  topicId?: string;
  title: string;
  scheduledAt: string;
  platforms: ScheduledContent['platforms'];
  content: ScheduledContent['content'];
}): ScheduledContent {
  const items = getScheduledContent();
  const newItem: ScheduledContent = {
    id: Date.now().toString(),
    topicId: data.topicId,
    title: data.title,
    scheduledAt: data.scheduledAt,
    status: 'scheduled',
    platforms: data.platforms,
    content: data.content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.push(newItem);
  saveScheduledContent(items);
  return newItem;
}

/**
 * Update scheduled content
 */
export function updateScheduledContent(
  id: string, 
  data: Partial<Omit<ScheduledContent, 'id' | 'createdAt'>>
): ScheduledContent | null {
  const items = getScheduledContent();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  saveScheduledContent(items);
  return items[index];
}

/**
 * Delete scheduled content
 */
export function deleteScheduledContent(id: string): boolean {
  const items = getScheduledContent();
  const filtered = items.filter(item => item.id !== id);
  
  if (filtered.length === items.length) {
    return false;
  }

  saveScheduledContent(filtered);
  return true;
}

/**
 * Get content due for publishing
 */
export function getDueContent(): ScheduledContent[] {
  const items = getScheduledContent();
  const now = new Date();
  
  return items.filter(item => 
    item.status === 'scheduled' && 
    new Date(item.scheduledAt) <= now
  );
}

/**
 * Get content by status
 */
export function getContentByStatus(status: ScheduledContent['status']): ScheduledContent[] {
  const items = getScheduledContent();
  return items.filter(item => item.status === status);
}

/**
 * Mark content as published
 */
export function markAsPublished(id: string, paths: {
  blog?: string;
  linkedin?: string;
  twitter?: string;
}): ScheduledContent | null {
  return updateScheduledContent(id, {
    status: 'published',
    publishedPaths: paths,
  });
}

/**
 * Mark content as failed
 */
export function markAsFailed(id: string, error: string): ScheduledContent | null {
  return updateScheduledContent(id, {
    status: 'failed',
    error,
  });
}

/**
 * Get upcoming scheduled content (sorted by date)
 */
export function getUpcomingContent(limit: number = 10): ScheduledContent[] {
  const items = getScheduledContent();
  return items
    .filter(item => item.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, limit);
}
