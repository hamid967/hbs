type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function consumeLocalAccessRateLimit(key: string, maxAttempts: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= maxAttempts) return false;
  current.count += 1;
  return true;
}

export function clearLocalAccessRateLimitsForTests() {
  buckets.clear();
}
