import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, hashApiKey } from '@/lib/auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      console.log('[v0] Missing API key in admin keys GET');
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    console.log('[v0] Validating admin API key...');
    const auth = await validateApiKey(apiKey, 'admin');
    if (!auth) {
      console.log('[v0] Invalid or unauthorized API key');
      return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });
    }

    console.log('[v0] Admin key validated, fetching keys from database');
    const result = await query('SELECT id, label, role, rate_limit, is_active, created_at, last_used FROM api_keys ORDER BY id');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('[v0] Admin keys GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      console.log('[v0] Missing API key in admin keys POST');
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    console.log('[v0] Validating admin API key for POST...');
    const auth = await validateApiKey(apiKey, 'admin');
    if (!auth) {
      console.log('[v0] Invalid or unauthorized API key for POST');
      return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });
    }

    const { label, role, rate_limit } = await request.json();
    const rawKey = crypto.randomBytes(32).toString('hex');
    const keyHash = hashApiKey(rawKey);

    console.log('[v0] Creating new API key with role:', role);
    const result = await query(
      'INSERT INTO api_keys (key_hash, label, role, rate_limit) VALUES ($1, $2, $3, $4) RETURNING id',
      [keyHash, label || 'unnamed', role || 'user', rate_limit || 30]
    );

    return NextResponse.json({
      id: result.rows[0].id,
      api_key: rawKey,
      label: label || 'unnamed',
      role: role || 'user',
      rate_limit: rate_limit || 30,
      warning: 'Save this key - it will never be shown again!'
    }, { status: 201 });
  } catch (error: any) {
    console.error('[v0] Admin keys POST error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
