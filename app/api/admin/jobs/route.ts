import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 });

    const auth = await validateApiKey(apiKey, 'admin');
    if (!auth) return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 403 });

    const result = await query(
      `SELECT j.job_id, k.label as key_label, j.mode, j.sent_count, j.max_requests, j.status, j.started_at
       FROM jobs j LEFT JOIN api_keys k ON k.id = j.api_key_id
       ORDER BY j.started_at DESC LIMIT 50`
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
