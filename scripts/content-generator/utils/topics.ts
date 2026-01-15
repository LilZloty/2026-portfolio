/**
 * Unified Topic Management Utility
 * Shared by both CLI scripts and Admin UI
 */
import * as fs from 'fs';
import * as path from 'path';

const TOPICS_FILE = path.join(process.cwd(), 'content', 'topics.json');

export interface TopicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Topic {
  id: string;
  title: string;
  context: string;
  messages: TopicMessage[];
  createdAt: string;
  updatedAt: string;
  // New fields for enhanced tracking
  source?: 'cli' | 'admin' | 'rss';
  status?: 'idea' | 'draft' | 'published' | 'archived';
  tags?: string[];
  publishedPaths?: {
    blog?: string;
    linkedin?: string;
    twitter?: string;
  };
}

/**
 * Get all topics from storage
 */
export function getTopics(): Topic[] {
  if (!fs.existsSync(TOPICS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(TOPICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading topics file:', error);
    return [];
  }
}

/**
 * Save all topics to storage
 */
export function saveTopics(topics: Topic[]): void {
  const dir = path.dirname(TOPICS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));
}

/**
 * Get a single topic by ID
 */
export function getTopicById(id: string): Topic | undefined {
  const topics = getTopics();
  return topics.find(t => t.id === id);
}

/**
 * Create a new topic
 */
export function createTopic(data: {
  title: string;
  context?: string;
  messages?: TopicMessage[];
  source?: 'cli' | 'admin' | 'rss';
  status?: 'idea' | 'draft' | 'published' | 'archived';
  tags?: string[];
}): Topic {
  const topics = getTopics();
  const newTopic: Topic = {
    id: Date.now().toString(),
    title: data.title,
    context: data.context || '',
    messages: data.messages || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: data.source || 'cli',
    status: data.status || 'idea',
    tags: data.tags || [],
  };

  topics.push(newTopic);
  saveTopics(topics);
  return newTopic;
}

/**
 * Update an existing topic
 */
export function updateTopic(id: string, data: Partial<Omit<Topic, 'id' | 'createdAt'>>): Topic | null {
  const topics = getTopics();
  const index = topics.findIndex(t => t.id === id);
  
  if (index === -1) {
    return null;
  }

  topics[index] = {
    ...topics[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  saveTopics(topics);
  return topics[index];
}

/**
 * Delete a topic
 */
export function deleteTopic(id: string): boolean {
  const topics = getTopics();
  const filtered = topics.filter(t => t.id !== id);
  
  if (filtered.length === topics.length) {
    return false;
  }

  saveTopics(filtered);
  return true;
}

/**
 * Get topics by status (for CLI workflow)
 */
export function getTopicsByStatus(status: Topic['status']): Topic[] {
  const topics = getTopics();
  return topics.filter(t => t.status === status);
}

/**
 * Get topics by source
 */
export function getTopicsBySource(source: Topic['source']): Topic[] {
  const topics = getTopics();
  return topics.filter(t => t.source === source);
}

/**
 * Get topics by tags
 */
export function getTopicsByTags(tags: string[]): Topic[] {
  const topics = getTopics();
  return topics.filter(t => 
    t.tags && t.tags.some(tag => tags.includes(tag))
  );
}

/**
 * Mark a topic as published and record paths
 */
export function markTopicPublished(id: string, paths: {
  blog?: string;
  linkedin?: string;
  twitter?: string;
}): Topic | null {
  return updateTopic(id, {
    status: 'published',
    publishedPaths: paths,
  });
}

/**
 * Get recent topics (sorted by updatedAt, most recent first)
 */
export function getRecentTopics(limit: number = 10): Topic[] {
  const topics = getTopics();
  return topics
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

/**
 * Search topics by title or context
 */
export function searchTopics(query: string): Topic[] {
  const topics = getTopics();
  const lowerQuery = query.toLowerCase();
  return topics.filter(t => 
    t.title.toLowerCase().includes(lowerQuery) ||
    t.context.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get unpublished topics (ideas and drafts)
 */
export function getUnpublishedTopics(): Topic[] {
  const topics = getTopics();
  return topics.filter(t => t.status === 'idea' || t.status === 'draft');
}
