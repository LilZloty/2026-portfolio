import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import { recordUsage } from '@/../scripts/content-generator/utils/usage-tracker';

/**
 * Generate multiple title options for A/B testing
 */

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

interface TitlesRequest {
  topic: string;
  context: string;
  contentSummary?: string;
}

const TITLES_PROMPT = `You are Theo Daudebourg, a Shopify performance specialist.

Generate 3 compelling blog post title options for the topic below.

## TITLE GUIDELINES:
- Under 60 characters each (for SEO)
- Include the primary keyword
- Make each title use a different style:
  1. **Direct/Clear**: States the main benefit or topic clearly
  2. **Curiosity-Driven**: Creates intrigue or asks a question
  3. **Number/List-Based**: Uses a specific number for clickability

## RULES:
- NO emojis or special characters
- Use regular dashes (-) not em-dashes
- Be specific, avoid generic phrases
- Match the brand voice: honest, no-BS, results-focused

## OUTPUT FORMAT:
Return ONLY a JSON array with 3 title strings, nothing else:
["Title 1", "Title 2", "Title 3"]

TOPIC: {TOPIC}

CONTEXT: {CONTEXT}

{SUMMARY}`;

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

    const body: TitlesRequest = await request.json();
    const { topic, context, contentSummary } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const prompt = TITLES_PROMPT
      .replace('{TOPIC}', topic)
      .replace('{CONTEXT}', context || 'No additional context provided')
      .replace('{SUMMARY}', contentSummary ? `CONTENT SUMMARY: ${contentSummary}` : '');

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4.1-thinking',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.8, // Higher for more variety
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
    const content = data.choices?.[0]?.message?.content || '[]';

    // Track usage
    if (data.usage) {
      recordUsage({
        endpoint: '/api/admin/generate-titles',
        model: 'grok-4.1-thinking',
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0,
        requestType: 'generate',
      });
    }

    // Parse titles from response
    let titles: string[];
    try {
      // Find JSON array in response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      titles = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      // Fallback: split by newlines if not valid JSON
      titles = content
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^[\d\.\-\*]\s*/, '').trim())
        .slice(0, 3);
    }

    // Validate we have 3 titles
    if (titles.length < 3) {
      return NextResponse.json(
        { error: 'Failed to generate 3 title options' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      titles: titles.slice(0, 3),
      metadata: {
        styles: ['Direct/Clear', 'Curiosity-Driven', 'Number/List-Based'],
      },
    });
  } catch (error) {
    console.error('Generate titles error:', error);
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    );
  }
}
