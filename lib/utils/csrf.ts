import { NextRequest, NextResponse } from 'next/server';
import Tokens from 'csrf';

const tokens = new Tokens();

export function generateCSRFToken(secret: string) {
  return tokens.create(secret);
}

export function verifyCSRFToken(secret: string, token: string | null | undefined) {
  if (!token) return false;
  return tokens.verify(secret, token);
}

// Middleware for API routes
export function withCSRFProtection(handler: Function) {
  return async function (req: NextRequest, ...args: any[]) {
    // Use a secret from env or fallback (should be long/random in production)
    const secret = process.env.CSRF_SECRET || 'dev-secret-please-change';
    const csrfToken = req.headers.get('x-csrf-token');
    if (!verifyCSRFToken(secret, csrfToken)) {
      return NextResponse.json({ error: 'Invalid or missing CSRF token.' }, { status: 403 });
    }
    return handler(req, ...args);
  };
}
