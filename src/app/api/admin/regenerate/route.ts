import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import { recordUsage } from '@/../scripts/content-generator/utils/usage-tracker';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

interface RegenerateRequest {
  contentType: 'blog' | 'linkedin' | 'twitter';
  previousContent: string;
  feedback: string;
  context: {
    topic: string;
    topicContext: string;
    messages: Array<{ role: string; content: string }>;
  };
}

const REGENERATE_PROMPTS = {
  blog: `You are Theo Daudebourg, a Shopify performance specialist.

The user has provided feedback on a previous blog post draft. Improve the content based on their feedback while maintaining:
- First-person perspective
- No emojis or special Unicode
- Brand voice: honest, no-BS, results-obsessed
- SEO-optimized structure with H2/H3 headers
- Valid MDX frontmatter

USER FEEDBACK: {FEEDBACK}

PREVIOUS CONTENT:
{PREVIOUS}

CONTEXT:
{CONTEXT}

Rewrite the blog post incorporating the feedback. Return ONLY the improved content.`,

  linkedin: `You are Theo Daudebourg, a Shopify performance specialist.

The user wants you to improve a LinkedIn post based on their feedback.

RULES:
- MAX 1200 characters
- NO emojis
- Hook in first 2 lines
- End with question or CTA

USER FEEDBACK: {FEEDBACK}

PREVIOUS POST:
{PREVIOUS}

Rewrite incorporating the feedback. Return ONLY the post text.`,

  twitter: `You are Theo Daudebourg. Improve this tweet based on user feedback.

RULES:
- Under 280 characters
- NO emojis
- Be punchy and opinionated

USER FEEDBACK: {FEEDBACK}

PREVIOUS TWEET:
{PREVIOUS}

Return ONLY the improved tweet.`,
};

export async function POST(request: NextRequest) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.valid) {
      return auth.error;
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROK_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body: RegenerateRequest = await request.json();
    const { contentType, previousContent, feedback, context } = body;

    if (!contentType || !previousContent || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: contentType, previousContent, feedback' },
        { status: 400 }
      );
    }

    // Build context string
    const conversationContext = context.messages
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
      .join('\n\n');
    
    const fullContext = `Topic: ${context.topic}\n\nContext: ${context.topicContext}\n\nConversation:\n${conversationContext}`;

    // Build prompt
    const promptTemplate = REGENERATE_PROMPTS[contentType];
    const prompt = promptTemplate
      .replace('{FEEDBACK}', feedback)
      .replace('{PREVIOUS}', previousContent)
      .replace('{CONTEXT}', fullContext);

    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4.1-thinking',
        messages: [
          { role: 'user', content: prompt },
        ],
        max_tokens: 16384,
        temperature: 0.7,
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
    const regeneratedContent = data.choices?.[0]?.message?.content || '';

    // Track usage
    if (data.usage) {
      recordUsage({
        endpoint: '/api/admin/regenerate',
        model: 'grok-4.1-thinking',
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0,
        requestType: 'regenerate',
      });
    }

    return NextResponse.json({
      success: true,
      content: regeneratedContent,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Regenerate API error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}
