import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * LinkedIn OAuth 2.0 Callback Handler
 * 
 * Setup Required:
 * 1. Create app at https://www.linkedin.com/developers/
 * 2. Add redirect URI: {YOUR_DOMAIN}/api/auth/linkedin
 * 3. Set environment variables:
 *    - LINKEDIN_CLIENT_ID
 *    - LINKEDIN_CLIENT_SECRET  
 *    - LINKEDIN_REDIRECT_URI
 */

const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

// Store state for validation (in production, use Redis or session)
const stateStore = new Map<string, number>();

// GET - Handle OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(
      new URL('/admin?linkedinError=' + encodeURIComponent(errorDescription || error), request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 });
  }

  // Validate state to prevent CSRF
  const stateTimestamp = stateStore.get(state);
  if (!stateTimestamp) {
    return NextResponse.redirect(
      new URL('/admin?linkedinError=Invalid state. Please try again.', request.url)
    );
  }
  stateStore.delete(state);
  
  // Check if state is expired (10 minutes)
  if (Date.now() - stateTimestamp > 10 * 60 * 1000) {
    return NextResponse.redirect(
      new URL('/admin?linkedinError=Session expired. Please try again.', request.url)
    );
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing LinkedIn OAuth configuration');
    return NextResponse.redirect(
      new URL('/admin?linkedinError=OAuth not configured', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn token exchange failed');
      return NextResponse.redirect(
        new URL('/admin?linkedinError=Token exchange failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    
    // In production: save tokens to encrypted storage
    // Token obtained successfully - do not log token details

    // Redirect back to admin with success
    return NextResponse.redirect(
      new URL('/admin?linkedinConnected=true', request.url)
    );
  } catch (error) {
    console.error('LinkedIn OAuth connection failed');
    return NextResponse.redirect(
      new URL('/admin?linkedinError=Connection failed', request.url)
    );
  }
}

// POST - Initiate OAuth flow (generate authorization URL)
export async function POST() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI.' },
      { status: 500 }
    );
  }

  const scope = 'openid profile w_member_social';
  
  // Use cryptographically secure state
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, Date.now());
  
  // Clean up old states after 10 minutes
  setTimeout(() => stateStore.delete(state), 10 * 60 * 1000);

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope,
  })}`;

  return NextResponse.json({ authUrl });
}
