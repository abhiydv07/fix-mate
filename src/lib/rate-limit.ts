/**
 * Simple in-memory rate limiter.
 * For production, use Redis (upstash/ratelimit) or Vercel Edge config.
 */

const store = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}, 300_000);

/**
 * Check rate limit. Returns true if allowed.
 * @param key - Unique identifier (e.g. IP + route)
 * @param maxRequests - Max requests in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

/** Extract client IP from request headers */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/** Helper: enforce rate limit or return NextResponse error */
export function enforceRateLimit(
  request: Request,
  route: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; headers: Record<string, string> } {
  const ip = getClientIp(request);
  const key = `${route}:${ip}`;
  const result = rateLimit(key, maxRequests, windowMs);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };

  return { allowed: result.allowed, headers };
}
