import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Simple JWT creation
export function createJWT(userId: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify JWT
export function verifyJWT(token: string): { userId: string } | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

// Hash password using crypto (simple approach - use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const testHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return testHash === hash;
}

// Generate user secret key
export function generateUserSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash API key
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

// Validate API key (with MASTER_API_KEY support)
export async function validateApiKey(rawKey: string, requiredRole: 'user' | 'admin' = 'user') {
  const MASTER_KEY = process.env.MASTER_API_KEY || 'smsburst12345';
  
  if (rawKey === MASTER_KEY) {
    return { id: 0, role: 'admin', rateLimit: 999 };
  }

  const { getApiKeyInfo, updateApiKeyLastUsed, checkRateLimit } = await import('./db');
  const keyHash = hashApiKey(rawKey);
  const info = await getApiKeyInfo(keyHash);

  if (!info) return null;
  if (requiredRole === 'admin' && info.role !== 'admin') return null;

  const allowed = await checkRateLimit(keyHash, info.rate_limit);
  if (!allowed) throw new Error('Rate limit exceeded');

  await updateApiKeyLastUsed(keyHash);
  return { id: info.id, role: info.role, rateLimit: info.rate_limit };
}
