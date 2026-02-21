import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('[v0] CRITICAL: DATABASE_URL environment variable is not set');
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

// Test connection on first query
let connectionTested = false;

export async function query(text: string, params?: unknown[]) {
  try {
    if (!connectionTested) {
      console.log('[v0] Testing database connection...');
      await pool.query('SELECT 1');
      connectionTested = true;
      console.log('[v0] Database connection successful');
    }
    
    const client = await pool.connect();
    try {
      console.log('[v0] Executing query:', text.substring(0, 50) + '...');
      const result = await client.query(text, params);
      console.log('[v0] Query successful, rows:', result.rowCount);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[v0] Database query error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function getUser(userId: string | number) {
  const result = await query('SELECT id, email, credits, created_at FROM users WHERE id = $1', [
    Number(userId),
  ]);
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT id, email, password_hash, credits, user_secret, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

export async function createUser(
  email: string,
  passwordHash: string,
  userSecret: string,
  initialCredits: number = 100
) {
  const result = await query(
    'INSERT INTO users (email, password_hash, user_secret, credits) VALUES ($1, $2, $3, $4) RETURNING id, email, credits',
    [email, passwordHash, userSecret, initialCredits]
  );
  return result.rows[0];
}

export async function getUserCredits(userId: string | number) {
  const result = await query('SELECT credits FROM users WHERE id = $1', [Number(userId)]);
  return result.rows[0]?.credits || 0;
}

export async function deductCredits(userId: string | number, amount: number) {
  const result = await query(
    'UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING credits',
    [amount, Number(userId)]
  );
  return result.rows[0];
}

export async function addCredits(userId: string | number, amount: number) {
  const result = await query(
    'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits',
    [amount, Number(userId)]
  );
  return result.rows[0];
}

export async function createCampaign(
  userId: string | number,
  name: string,
  description: string,
  renderServiceId: string
) {
  const result = await query(
    'INSERT INTO campaigns (user_id, name, description, render_service_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, status, created_at',
    [Number(userId), name, description, renderServiceId, 'pending']
  );
  return result.rows[0];
}

export async function getCampaigns(userId: string | number) {
  const result = await query(
    'SELECT id, name, description, status, created_at FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC',
    [Number(userId)]
  );
  return result.rows;
}

export async function recordCreditTransaction(
  userId: string | number,
  amount: number,
  type: 'deduction' | 'purchase',
  description: string
) {
  const result = await query(
    'INSERT INTO credit_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4) RETURNING id, amount, transaction_type, created_at',
    [Number(userId), amount, type, description]
  );
  return result.rows[0];
}

export async function getCreditTransactions(userId: string | number, limit: number = 20) {
  const result = await query(
    'SELECT id, amount, transaction_type, description, created_at FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [Number(userId), limit]
  );
  return result.rows;
}

export async function getApiKeyInfo(keyHash: string) {
  const result = await query(
    'SELECT id, role, rate_limit FROM api_keys WHERE key_hash = $1 AND is_active = TRUE',
    [keyHash]
  );
  return result.rows[0];
}

export async function updateApiKeyLastUsed(keyHash: string) {
  await query('UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1', [keyHash]);
}

export async function isBlacklisted(phone: string) {
  const result = await query('SELECT 1 FROM blacklist WHERE phone = $1', [phone]);
  return result.rows.length > 0;
}

export async function checkRateLimit(keyHash: string, limit: number) {
  const result = await query(
    "SELECT COUNT(*) FROM rate_log WHERE key_hash = $1 AND hit_at > NOW() - INTERVAL '1 minute'",
    [keyHash]
  );
  const count = parseInt(result.rows[0].count);
  if (count >= limit) return false;

  await query('INSERT INTO rate_log (key_hash) VALUES ($1)', [keyHash]);
  await query("DELETE FROM rate_log WHERE hit_at < NOW() - INTERVAL '5 minutes'");
  return true;
}

export async function updateCampaignStatus(campaignId: number, status: string, renderDeploymentId?: string) {
  await query(
    'UPDATE campaigns SET status = $1, render_deployment_id = $2, updated_at = NOW() WHERE id = $3',
    [status, renderDeploymentId || null, campaignId]
  );
}
