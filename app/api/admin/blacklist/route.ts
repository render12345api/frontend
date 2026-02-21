import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 });

    const auth = await validateApiKey(apiKey, 'admin');
    if (!auth) return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });

    const result = await query('SELECT phone, added_at FROM blacklist ORDER BY id DESC');
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

    const { phone } = await request.json();
    const cleanPhone = String(phone).trim().slice(-10);
    if (cleanPhone.length < 10) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });

    await query('INSERT INTO blacklist (phone) VALUES ($1) ON CONFLICT DO NOTHING', [cleanPhone]);
    return NextResponse.json({ phone: cleanPhone, status: 'blacklisted' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
