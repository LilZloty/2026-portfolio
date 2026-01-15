import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Twitter/X OAuth 2.0 PKCE Handler
 * 
 * Setup Required:
 * 1. Create app at https://developer.twitter.com/
 * 2. Enable OAuth 2.0 with User authentication
 * 3. Add callback URL: {YOUR_DOMAIN}/api/auth/twitter
 * 4. Set environment variables:
 *    - TWITTER_CLIENT_ID
 *    - TWITTER_CLIENT_SECRET (for confidential clients)
 *    - TWITTER_REDIRECT_URI
 */

const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

// Store PKCE verifier temporarily (in production, use session/redis)
const pkceStore = new Map<string, string>();

// GET - Handle OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('Twitter OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL('/admin?twitterError=' + encodeURIComponent(errorDescription || error), request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 });
  }

  // Retrieve PKCE verifier
  const codeVerifier = pkceStore.get(state);
  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL('/admin?twitterError=Invalid state. Please try again.', request.url)
    );
  }
  pkceStore.delete(state);

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL('/admin?twitterError=OAuth not configured', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(clientSecret && {
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        }),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitter token error:', errorText);
      return NextResponse.redirect(
        new URL('/admin?twitterError=Token exchange failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    
    // Token obtained successfully - do not log token details

    // In production, save tokens to secure storage
    // tokenData includes: access_token, refresh_token, expires_in, scope

    return NextResponse.redirect(
      new URL('/admin?twitterConnected=true', request.url)
    );
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(
      new URL('/admin?twitterError=Connection failed', request.url)
    );
  }
}

// POST - Initiate OAuth flow with PKCE
export async function POST() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Twitter OAuth not configured. Set TWITTER_CLIENT_ID and TWITTER_REDIRECT_URI.' },
      { status: 500 }
    );
  }

  // Generate PKCE challenge
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const state = crypto.randomBytes(16).toString('hex');
  
  // Store verifier for callback
  pkceStore.set(state, codeVerifier);
  
  // Clean up old entries after 10 minutes
  setTimeout(() => pkceStore.delete(state), 10 * 60 * 1000);

  const scope = 'tweet.read tweet.write users.read offline.access';

  const authUrl = `https://twitter.com/i/oauth2/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })}`;

  return NextResponse.json({ authUrl });
}
