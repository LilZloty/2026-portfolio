/**
 * API Usage & Cost Tracking
 * Monitors Grok API token usage and calculates costs
 */
import * as fs from 'fs';
import * as path from 'path';

const USAGE_FILE = path.join(process.cwd(), 'content', 'api-usage.json');

// Grok API pricing (approximate, update as needed)
const PRICING = {
  'grok-4.1-thinking': {
    inputPer1k: 0.003,   // $3 per 1M input tokens
    outputPer1k: 0.015,  // $15 per 1M output tokens
  },
  'grok-4-latest': {
    inputPer1k: 0.002,
    outputPer1k: 0.010,
  },
  'default': {
    inputPer1k: 0.002,
    outputPer1k: 0.010,
  }
};

export interface UsageRecord {
  id: string;
  timestamp: string;
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestType: 'chat' | 'generate' | 'regenerate' | 'other';
}

export interface UsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, { requests: number; tokens: number; cost: number }>;
  byEndpoint: Record<string, { requests: number; tokens: number; cost: number }>;
  byDay: Record<string, { requests: number; tokens: number; cost: number }>;
}

/**
 * Get all usage records
 */
export function getUsageRecords(): UsageRecord[] {
  if (!fs.existsSync(USAGE_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading usage file:', error);
    return [];
  }
}

/**
 * Save all usage records
 */
function saveUsageRecords(records: UsageRecord[]): void {
  const dir = path.dirname(USAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(USAGE_FILE, JSON.stringify(records, null, 2));
}

/**
 * Calculate estimated cost based on tokens and model
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING.default;
  const inputCost = (inputTokens / 1000) * pricing.inputPer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputPer1k;
  return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimals
}

/**
 * Record API usage
 */
export function recordUsage(data: {
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  requestType: UsageRecord['requestType'];
}): UsageRecord {
  const records = getUsageRecords();
  
  const totalTokens = data.inputTokens + data.outputTokens;
  const estimatedCost = calculateCost(data.model, data.inputTokens, data.outputTokens);
  
  const record: UsageRecord = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    endpoint: data.endpoint,
    model: data.model,
    inputTokens: data.inputTokens,
    outputTokens: data.outputTokens,
    totalTokens,
    estimatedCost,
    requestType: data.requestType,
  };
  
  records.push(record);
  
  // Keep only last 1000 records to prevent file bloat
  if (records.length > 1000) {
    records.splice(0, records.length - 1000);
  }
  
  saveUsageRecords(records);
  return record;
}

/**
 * Get usage summary with aggregations
 */
export function getUsageSummary(days: number = 30): UsageSummary {
  const records = getUsageRecords();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentRecords = records.filter(r => new Date(r.timestamp) >= cutoffDate);
  
  const summary: UsageSummary = {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCost: 0,
    byModel: {},
    byEndpoint: {},
    byDay: {},
  };
  
  for (const record of recentRecords) {
    summary.totalRequests++;
    summary.totalInputTokens += record.inputTokens;
    summary.totalOutputTokens += record.outputTokens;
    summary.totalTokens += record.totalTokens;
    summary.totalCost += record.estimatedCost;
    
    // By model
    if (!summary.byModel[record.model]) {
      summary.byModel[record.model] = { requests: 0, tokens: 0, cost: 0 };
    }
    summary.byModel[record.model].requests++;
    summary.byModel[record.model].tokens += record.totalTokens;
    summary.byModel[record.model].cost += record.estimatedCost;
    
    // By endpoint
    if (!summary.byEndpoint[record.endpoint]) {
      summary.byEndpoint[record.endpoint] = { requests: 0, tokens: 0, cost: 0 };
    }
    summary.byEndpoint[record.endpoint].requests++;
    summary.byEndpoint[record.endpoint].tokens += record.totalTokens;
    summary.byEndpoint[record.endpoint].cost += record.estimatedCost;
    
    // By day
    const day = record.timestamp.slice(0, 10);
    if (!summary.byDay[day]) {
      summary.byDay[day] = { requests: 0, tokens: 0, cost: 0 };
    }
    summary.byDay[day].requests++;
    summary.byDay[day].tokens += record.totalTokens;
    summary.byDay[day].cost += record.estimatedCost;
  }
  
  // Round total cost
  summary.totalCost = Math.round(summary.totalCost * 100) / 100;
  
  return summary;
}

/**
 * Get today's usage
 */
export function getTodayUsage(): { requests: number; tokens: number; cost: number } {
  const summary = getUsageSummary(1);
  const today = new Date().toISOString().slice(0, 10);
  return summary.byDay[today] || { requests: 0, tokens: 0, cost: 0 };
}

/**
 * Get this month's usage
 */
export function getMonthUsage(): { requests: number; tokens: number; cost: number } {
  const summary = getUsageSummary(31);
  return {
    requests: summary.totalRequests,
    tokens: summary.totalTokens,
    cost: summary.totalCost,
  };
}
