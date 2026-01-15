import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { recordUsage } from '@/../scripts/content-generator/utils/usage-tracker';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  systemPrompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const auth = validateAdminAuth(request);
    if (!auth.valid) {
      return auth.error;
    }

    // Rate limiting - expensive operations
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 'admin-chat', RATE_LIMITS.expensive);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before making more requests.' },
        { 
          status: 429,
          headers: rateLimitHeaders(rateLimit.remaining, rateLimit.resetIn),
        }
      );
    }

    const apiKey = process.env.GROK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROK_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { messages, systemPrompt } = body;

    // Build messages array with system prompt
    const grokMessages: Message[] = [];
    
    if (systemPrompt) {
      grokMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    grokMessages.push(...messages);

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4.1-thinking',
        messages: grokMessages,
        max_tokens: 16384,
        temperature: 0.7,
        stream: false,
        search_mode: 'auto',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Grok API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    // Track usage
    if (data.usage) {
      recordUsage({
        endpoint: '/api/admin/chat',
        model: 'grok-4.1-thinking',
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0,
        requestType: 'chat',
      });
    }

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
