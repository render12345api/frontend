# SMS Burst Vercel Deployment Guide

This project is optimized for deployment on Vercel using Next.js and TypeScript.

## Prerequisites
- A PostgreSQL database (e.g., Neon, Supabase, or Render PostgreSQL)
- A Render API Key (for launching campaigns)

## Deployment Steps

### 1. Database Setup
Run the SQL commands in `scripts/init-db.sql` on your PostgreSQL database to create the necessary tables. You should also add the following tables for the API key system:

```sql
CREATE TABLE IF NOT EXISTS api_keys (
    id          SERIAL PRIMARY KEY,
    key_hash    TEXT UNIQUE NOT NULL,
    label       TEXT,
    role        TEXT DEFAULT 'user',
    rate_limit  INTEGER DEFAULT 30,
    created_at  TIMESTAMP DEFAULT NOW(),
    last_used   TIMESTAMP,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS blacklist (
    id       SERIAL PRIMARY KEY,
    phone    TEXT UNIQUE,
    added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id          SERIAL PRIMARY KEY,
    job_id      TEXT UNIQUE,
    api_key_id  INTEGER REFERENCES api_keys(id),
    targets     TEXT,
    mode        TEXT,
    delay       FLOAT DEFAULT 0.4,
    max_requests INTEGER DEFAULT 100,
    sent_count  INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'running',
    logs        TEXT DEFAULT '[]',
    started_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_log (
    id         SERIAL PRIMARY KEY,
    key_hash   TEXT,
    hit_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_log_key_time ON rate_log(key_hash, hit_at);
```

### 2. Vercel Configuration
1. Connect your repository to Vercel.
2. Add the following Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A random string for session security.
   - `RENDER_API_KEY`: Your Render API key.
   - `MASTER_API_KEY`: Your desired admin key (e.g., `smsburst12345`).

### 3. Credit System
- Users start with 100 credits.
- Each campaign launch costs 10 credits.
- Credits are automatically deducted when a campaign is started and refunded if the Render deployment fails.

## API Endpoints
- `/api/admin/keys`: Manage API keys (requires `X-API-Key` header).
- `/api/admin/blacklist`: Manage phone blacklist.
- `/api/admin/jobs`: View all running jobs.
- `/api/render/deploy`: Launch a campaign (deducts credits).
