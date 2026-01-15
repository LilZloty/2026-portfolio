/**
 * Conversation Persistence Utility
 * Server-side storage for chat history
 */
import * as fs from 'fs';
import * as path from 'path';

const CONVERSATIONS_DIR = path.join(process.cwd(), 'content', 'conversations');

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  topicContext?: string;
  messages: Message[];
  drafts?: {
    blog: string;
    linkedin: string;
    twitter: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

/**
 * Ensure conversations directory exists
 */
function ensureDir(): void {
  if (!fs.existsSync(CONVERSATIONS_DIR)) {
    fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
  }
}

/**
 * Get conversation file path
 */
function getFilePath(id: string): string {
  return path.join(CONVERSATIONS_DIR, `${id}.json`);
}

/**
 * Get all conversations (metadata only for listing)
 */
export function listConversations(): Array<{
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}> {
  ensureDir();
  
  try {
    const files = fs.readdirSync(CONVERSATIONS_DIR)
      .filter(f => f.endsWith('.json'));
    
    return files.map(file => {
      const content = fs.readFileSync(path.join(CONVERSATIONS_DIR, file), 'utf-8');
      const conv = JSON.parse(content) as Conversation;
      return {
        id: conv.id,
        title: conv.title,
        messageCount: conv.messages.length,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        archived: conv.archived,
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error listing conversations:', error);
    return [];
  }
}

/**
 * Get a single conversation
 */
export function getConversation(id: string): Conversation | null {
  const filePath = getFilePath(id);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading conversation:', error);
    return null;
  }
}

/**
 * Create a new conversation
 */
export function createConversation(data: {
  title: string;
  topicContext?: string;
  messages?: Message[];
}): Conversation {
  ensureDir();
  
  const conversation: Conversation = {
    id: Date.now().toString(),
    title: data.title,
    topicContext: data.topicContext,
    messages: data.messages || [],
    drafts: { blog: '', linkedin: '', twitter: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  };
  
  fs.writeFileSync(getFilePath(conversation.id), JSON.stringify(conversation, null, 2));
  return conversation;
}

/**
 * Update a conversation
 */
export function updateConversation(
  id: string,
  data: Partial<Omit<Conversation, 'id' | 'createdAt'>>
): Conversation | null {
  const conversation = getConversation(id);
  
  if (!conversation) {
    return null;
  }
  
  const updated: Conversation = {
    ...conversation,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(getFilePath(id), JSON.stringify(updated, null, 2));
  return updated;
}

/**
 * Add a message to a conversation
 */
export function addMessage(id: string, message: Omit<Message, 'id' | 'timestamp'>): Conversation | null {
  const conversation = getConversation(id);
  
  if (!conversation) {
    return null;
  }
  
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  
  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date().toISOString();
  
  fs.writeFileSync(getFilePath(id), JSON.stringify(conversation, null, 2));
  return conversation;
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  const filePath = getFilePath(id);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Archive a conversation
 */
export function archiveConversation(id: string): Conversation | null {
  return updateConversation(id, { archived: true });
}

/**
 * Export conversation as markdown
 */
export function exportAsMarkdown(id: string): string | null {
  const conversation = getConversation(id);
  
  if (!conversation) {
    return null;
  }
  
  let markdown = `# ${conversation.title}\n\n`;
  markdown += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
  markdown += `Last Updated: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
  
  if (conversation.topicContext) {
    markdown += `## Context\n${conversation.topicContext}\n\n`;
  }
  
  markdown += `## Conversation\n\n`;
  
  for (const message of conversation.messages) {
    const role = message.role === 'user' ? '**You**' : '**AI**';
    const time = new Date(message.timestamp).toLocaleString();
    markdown += `### ${role} (${time})\n\n${message.content}\n\n---\n\n`;
  }
  
  if (conversation.drafts) {
    if (conversation.drafts.blog) {
      markdown += `## Blog Draft\n\n${conversation.drafts.blog}\n\n`;
    }
    if (conversation.drafts.linkedin) {
      markdown += `## LinkedIn Draft\n\n${conversation.drafts.linkedin}\n\n`;
    }
    if (conversation.drafts.twitter) {
      markdown += `## Twitter Draft\n\n${conversation.drafts.twitter}\n\n`;
    }
  }
  
  return markdown;
}
