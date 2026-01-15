import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth, createSession, invalidateSession } from '@/lib/admin-auth';

/**
 * POST - Login endpoint
 * Validates password and returns a session token
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 503 }
      );
    }
    
    // Validate password
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // Create session
    const sessionToken = createSession();
    
    return NextResponse.json({
      success: true,
      sessionToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Logout endpoint
 * Invalidates the current session
 */
export async function DELETE(request: NextRequest) {
  const sessionToken = request.headers.get('x-admin-session');
  
  if (sessionToken) {
    invalidateSession(sessionToken);
  }
  
  return NextResponse.json({ success: true });
}

/**
 * GET - Validate session
 */
export async function GET(request: NextRequest) {
  const auth = validateAdminAuth(request);
  
  if (!auth.valid) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  
  return NextResponse.json({ valid: true });
}
