import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory session store (use Redis in production)
const sessions = new Map<string, { createdAt: number; expiresAt: number }>();

// Session timeout: 24 hours
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

/**
 * Validates admin authentication for API routes
 * Uses server-side password (NOT exposed to client)
 */
export function validateAdminAuth(request: NextRequest): { valid: boolean; error?: NextResponse } {
  // Use non-PUBLIC env var for security
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // If no password is configured, deny access
  if (!adminPassword) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 503 }
      ),
    };
  }
  
  // Check for session token first (preferred)
  const sessionToken = request.headers.get('x-admin-session');
  if (sessionToken && isValidSession(sessionToken)) {
    return { valid: true };
  }
  
  // Fallback to password auth (for login)
  const authHeader = request.headers.get('x-admin-auth');
  
  // Use timing-safe comparison to prevent timing attacks
  if (!authHeader || !timingSafeEqual(authHeader, adminPassword)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  
  return { valid: true };
}

/**
 * Create a new session token after password verification
 */
export function createSession(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  sessions.set(token, {
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT,
  });
  
  // Clean up expired sessions
  cleanupSessions();
  
  return token;
}

/**
 * Validate a session token
 */
export function isValidSession(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  
  return true;
}

/**
 * Invalidate a session (logout)
 */
export function invalidateSession(token: string): void {
  sessions.delete(token);
}

/**
 * Clean up expired sessions
 */
function cleanupSessions(): void {
  const now = Date.now();
  const entries = Array.from(sessions.entries());
  for (const [token, session] of entries) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to maintain constant time
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
