import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';

/**
 * Post to Twitter/X API v2
 * 
 * Requires TWITTER_ACCESS_TOKEN to be set (obtained via OAuth flow)
 * 
 * Twitter API docs: https://developer.twitter.com/en/docs/twitter-api
 */

const TWITTER_API_URL = 'https://api.twitter.com/2';

interface PostRequest {
  content: string;
}

// POST - Create a tweet
export async function POST(request: NextRequest) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.valid) {
      return auth.error;
    }

    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Twitter not connected',
          action: 'Connect your Twitter account first via OAuth',
        },
        { status: 401 }
      );
    }

    const body: PostRequest = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate character limit
    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Content exceeds Twitter character limit (280 chars)' },
        { status: 400 }
      );
    }

    // Create the tweet
    const tweetResponse = await fetch(`${TWITTER_API_URL}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
      }),
    });

    if (!tweetResponse.ok) {
      const errorData = await tweetResponse.json();
      console.error('Twitter post error:', errorData);
      
      // Handle common errors
      if (tweetResponse.status === 401) {
        return NextResponse.json(
          { error: 'Twitter token expired. Please reconnect.' },
          { status: 401 }
        );
      }
      if (tweetResponse.status === 403) {
        return NextResponse.json(
          { error: 'Twitter API access denied. Check app permissions.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create tweet: ' + (errorData.detail || errorData.title || 'Unknown error') },
        { status: tweetResponse.status }
      );
    }

    const tweetData = await tweetResponse.json();
    const tweetId = tweetData.data?.id;
    
    // Get username for tweet URL
    const userResponse = await fetch(`${TWITTER_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    let tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      const username = userData.data?.username;
      if (username) {
        tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;
      }
    }

    return NextResponse.json({
      success: true,
      tweetId,
      tweetUrl,
      message: 'Posted to Twitter successfully!',
    });
  } catch (error) {
    console.error('Twitter post API error:', error);
    return NextResponse.json(
      { error: 'Failed to post to Twitter' },
      { status: 500 }
    );
  }
}

// GET - Check Twitter connection status
export async function GET(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  
  if (!accessToken) {
    return NextResponse.json({ 
      connected: false,
      message: 'Not connected to Twitter',
    });
  }

  // Verify token is still valid
  try {
    const response = await fetch(`${TWITTER_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json({ 
        connected: true,
        profile: {
          username: userData.data?.username,
          name: userData.data?.name,
        },
      });
    } else {
      return NextResponse.json({ 
        connected: false,
        message: 'Token expired or invalid',
      });
    }
  } catch {
    return NextResponse.json({ 
      connected: false,
      message: 'Failed to verify connection',
    });
  }
}
