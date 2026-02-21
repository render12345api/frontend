import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, hashApiKey } from '@/lib/auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 });

    const auth = await validateApiKey(apiKey, 'admin');
    if (!auth) return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });

    const result = await query('SELECT id, label, role, rate_limit, is_active, created_at, last_used FROM api_keys ORDER BY id');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 });

    const auth = await validateApiKey(apiKey, 'admin');
    if (!auth) return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });

    const { label, role, rate_limit } = await request.json();
    const rawKey = crypto.randomBytes(32).toString('hex');
    const keyHash = hashApiKey(rawKey);

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
