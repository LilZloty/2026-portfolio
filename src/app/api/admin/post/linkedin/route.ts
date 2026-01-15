import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';

/**
 * Post to LinkedIn API
 * 
 * Requires LINKEDIN_ACCESS_TOKEN to be set (obtained via OAuth flow)
 * 
 * LinkedIn API docs: https://learn.microsoft.com/en-us/linkedin/marketing/
 */

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

interface PostRequest {
  content: string;
}

// POST - Create a LinkedIn post
export async function POST(request: NextRequest) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.valid) {
      return auth.error;
    }

    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'LinkedIn not connected',
          action: 'Connect your LinkedIn account first via OAuth',
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
    if (content.length > 1300) {
      return NextResponse.json(
        { error: 'Content exceeds LinkedIn character limit (1300 chars)' },
        { status: 400 }
      );
    }

    // First, get the user's profile ID
    const profileResponse = await fetch(`${LINKEDIN_API_URL}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LinkedIn profile error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get LinkedIn profile. Token may be expired.' },
        { status: 401 }
      );
    }

    const profile = await profileResponse.json();
    const personUrn = `urn:li:person:${profile.sub}`;

    // Create the post
    const postResponse = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error('LinkedIn post error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create LinkedIn post: ' + errorText },
        { status: postResponse.status }
      );
    }

    const postData = await postResponse.json();

    // Extract post ID from response
    const postId = postData.id?.replace('urn:li:share:', '') || postData.id;
    const postUrl = `https://www.linkedin.com/feed/update/${postData.id || 'unknown'}`;

    return NextResponse.json({
      success: true,
      postId,
      postUrl,
      message: 'Posted to LinkedIn successfully!',
    });
  } catch (error) {
    console.error('LinkedIn post API error:', error);
    return NextResponse.json(
      { error: 'Failed to post to LinkedIn' },
      { status: 500 }
    );
  }
}

// GET - Check LinkedIn connection status
export async function GET(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  
  if (!accessToken) {
    return NextResponse.json({ 
      connected: false,
      message: 'Not connected to LinkedIn',
    });
  }

  // Verify token is still valid
  try {
    const response = await fetch(`${LINKEDIN_API_URL}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const profile = await response.json();
      return NextResponse.json({ 
        connected: true,
        profile: {
          name: profile.name,
          email: profile.email,
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
