# SMS Burst Application - Setup Guide

## Prerequisites
- Neon PostgreSQL database (already set up with connection string)
- Vercel account
- Environment variables configured

## Step 1: Initialize Your Database

Run all SQL commands from `scripts/init-db.sql` in your Neon console:

1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Copy-paste the entire content of `scripts/init-db.sql`
4. Execute the query

This creates:
- `users` table - stores user accounts
- `campaigns` table - stores SMS campaigns
- `credit_transactions` table - logs credit usage
- `api_keys` table - stores API keys for admin/user access
- `blacklist` table - blocked phone numbers
- `rate_log` table - rate limiting
- `sessions` table - JWT sessions

## Step 2: Configure Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```
DATABASE_URL = postgresql://neondb_owner:npg_cJi8CjrvmLH3@ep-square-recipe-a12q2cwj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET = your-random-secret-key-generate-one

MASTER_API_KEY = 123XYZ (or your preferred master key)

RENDER_API_KEY = (optional - only if using Render deployments)

NODE_ENV = production
```

## Step 3: Deploy to Vercel

1. Click **Publish** in the v0 editor
2. Connect to GitHub if not already
3. Select/create a repository
4. Choose **Next.js** as framework
5. Click **Deploy**

## How the Application Works

### User Authentication
- Users sign up with email/password
- JWT tokens stored in HTTP-only cookies
- 100 free credits on signup

### Campaigns
- Create SMS campaigns with phone numbers
- Each campaign costs 10 credits to deploy
- Deployment status tracked in real-time

### Credits System
- Users start with 100 credits
- Credits deducted when launching campaigns
- Refunded if deployment fails
- Purchase additional credits via billing page

### Admin Access
- Use `MASTER_API_KEY` to access admin endpoints
- Generate API keys with role-based access (admin/user)
- Set rate limits per key

## Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - List user's campaigns
- `POST /api/campaigns` - Create new campaign
- `POST /api/render/deploy` - Launch campaign (deducts credits)

### Credits
- `GET /api/credits/transactions` - View transaction history
- `POST /api/credits/purchase` - Buy credits

### Admin
- `GET /api/admin/keys` - List API keys (requires MASTER_API_KEY)
- `POST /api/admin/keys` - Create new API key
- `GET /api/admin/blacklist` - View blacklist
- `POST /api/admin/blacklist` - Add phone to blacklist
- `GET /api/admin/jobs` - View background jobs

## Troubleshooting

### "Internal server error" on login/signup
1. Check DATABASE_URL is set correctly in Vercel
2. Verify database tables were created (run init-db.sql)
3. Check app logs in Vercel dashboard

### Database connection errors
1. Verify DATABASE_URL has `?sslmode=require`
2. Check if Neon is in the correct region
3. Ensure connection string includes password

### Credit deduction not working
1. Verify `credit_transactions` table exists
2. Check `RENDER_API_KEY` is set (if using Render)
3. Review deployment logs for errors

## Production Recommendations

1. Generate a strong JWT_SECRET: `openssl rand -hex 32`
2. Change MASTER_API_KEY to a secure value
3. Set up database backups
4. Monitor rate limiting and adjust per key
5. Regularly audit API key usage
