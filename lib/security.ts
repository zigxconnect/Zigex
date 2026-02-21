/**
 * ZIGEX Security Utilities
 * 
 * This module provides security helper functions for protecting
 * the platform against common web vulnerabilities.
 */

/**
 * Sanitizes a string to prevent XSS attacks by escaping HTML entities.
 * Use this for any user-generated content that will be displayed.
 */
export function sanitizeHtml(str: string): string {
    if (!str || typeof str !== 'string') return '';

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validates that a UUID is properly formatted.
 * Use this to prevent SQL injection via malformed IDs.
 */
export function isValidUUID(str: string): boolean {
    if (!str || typeof str !== 'string') return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Validates that a company ID matches the user's authorized company.
 * This is the core multi-tenancy check.
 */
export function validateCompanyAccess(
    requestedCompanyId: string | undefined | null,
    authorizedCompanyId: string | undefined | null
): { valid: boolean; reason?: string } {
    // If no authorized company, user has no company access
    if (!authorizedCompanyId) {
        return { valid: false, reason: 'User is not associated with any company' };
    }

    // If no company was requested, allow (will use default)
    if (!requestedCompanyId) {
        return { valid: true };
    }

    // Check if the requested company matches the authorized one
    if (requestedCompanyId !== authorizedCompanyId) {
        return {
            valid: false,
            reason: `Access denied: Cannot access company ${requestedCompanyId}`
        };
    }

    return { valid: true };
}

/**
 * Rate limiting helper (in-memory, for development)
 * In production, use Redis or a proper rate limiting service.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    key: string,
    limit: number = 100,
    windowMs: number = 60000
): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        // Start new window
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count };
}

/**
 * Logs security events for monitoring and auditing.
 * In production, send these to a logging service.
 */
export function logSecurityEvent(
    eventType: 'ACCESS_DENIED' | 'RATE_LIMITED' | 'SUSPICIOUS_ACTIVITY' | 'AUTH_FAILURE',
    details: {
        userId?: string;
        action?: string;
        resource?: string;
        ip?: string;
        userAgent?: string;
        additionalInfo?: Record<string, any>;
    }
): void {
    const timestamp = new Date().toISOString();

    console.warn(`[SECURITY_EVENT] ${timestamp}`, {
        type: eventType,
        ...details
    });

    // TODO: In production, send to logging service (e.g., Sentry, LogRocket, custom logging API)
}

/**
 * Validates that a URL is safe to redirect to.
 * Prevents open redirect vulnerabilities.
 */
export function isSafeRedirectUrl(url: string, allowedHosts: string[] = []): boolean {
    if (!url || typeof url !== 'string') return false;

    try {
        const parsed = new URL(url, 'https://zigexconnect.com');

        // Only allow relative URLs or URLs from allowed hosts
        if (url.startsWith('/') && !url.startsWith('//')) {
            return true;
        }

        // Check against allowed hosts
        const defaultAllowed = ['zigexconnect.com', 'www.zigexconnect.com', 'localhost'];
        const allAllowed = [...defaultAllowed, ...allowedHosts];

        return allAllowed.includes(parsed.hostname);
    } catch {
        return false;
    }
}

/**
 * Generates a secure random token.
 * Use for CSRF tokens, session IDs, etc.
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
