# SMS Burst Debugging Guide

## Current Issues & Solutions

### Issue 1: "Failed to create account. Please try again." on Signup

**Root Cause**: Database connection or schema issues

**Debugging Steps**:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Deployments → Select Latest Deployment
   - Click "Runtime Logs" (not Build Logs)
   - Try signing up and watch the console output

2. **Look for these log messages**:
   - `[v0] ===== SIGNUP ERROR =====` indicates error occurred
   - Check `DATABASE_URL exists: true/false`
   - If `false` → DATABASE_URL not set in Vercel
   - Check the full error message

3. **Common Errors**:
   - **"Database connection failed"** → DATABASE_URL not set or invalid
   - **"Database schema not initialized"** → Run SQL migration
   - **"table users does not exist"** → SQL migration failed

### Issue 2: "Login failed. Please try again."

**Root Cause**: Same as signup - database connection

**Debug Steps**:
1. Check Vercel Function Logs (Runtime Logs tab)
2. Look for `[v0] Login attempt for: [email]`
3. Then look for `[v0] User lookup returned: true/false`
4. Check error messages

### Issue 3: Build Error - "output: export" conflict

**Root Cause**: Vercel build cache thinks app uses static export

**Solution**:
1. Go to Vercel Dashboard
2. Go to Settings → Git
3. Click "Clear Build Cache"
4. Redeploy

## Step-by-Step Deployment Checklist

### 1. Set Environment Variables in Vercel

Go to Vercel Dashboard → Settings → Environment Variables

Add EXACTLY these three:

```
DATABASE_URL = postgresql://neondb_owner:npg_cJi8CjrvmLH3@ep-square-recipe-a12q2cwj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET = any_random_string_here_at_least_32_chars

MASTER_API_KEY = 123XYZ
```

### 2. Verify SQL Migration Was Run

Go to your Neon console:
1. Open SQL Editor
2. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema='public';`
3. You should see: users, campaigns, credit_transactions, etc.

If missing, run the full SQL from `scripts/init-db.sql`

### 3. Test Signup Flow

1. Open the app in browser
2. Go to `/auth/signup`
3. Fill in: test@example.com / Password123 / Password123
4. Watch Vercel Runtime Logs while clicking signup
5. Check the log output for detailed error messages

### 4. If Still Failing

**Check DATABASE_URL is correct**:
- Copy it exactly from Neon Dashboard
- Ensure it includes: `?sslmode=require&channel_binding=require`
- No typos or extra spaces

**Verify database is running**:
- Go to Neon Dashboard
- Click your project
- Check "Project Status" - should say "Available"

**Clear everything and redeploy**:
1. Vercel Dashboard → Settings → Git → Clear Build Cache
2. Redeploy by pushing a commit or clicking Deploy

## Quick Log Analysis

When you see the logs, look for this sequence:

**Good Signup Flow**:
```
[v0] DATABASE_URL not configured ← Should NOT appear if env set
[v0] Starting user creation for: test@example.com
[v0] Password hash created
[v0] User secret generated, calling createUser...
[v0] createUser returned: { id: 1, email: 'test@example.com', credits: 5000 }
[v0] User created successfully with ID: 1
[v0] IP tracked for user...
```

**Bad Signup Flow**:
```
[v0] ===== SIGNUP ERROR =====
[v0] Error Type: Error
[v0] Error Message: connect ECONNREFUSED ← Database not reachable
[v0] DATABASE_URL exists: true
[v0] NODE_ENV: production
```

## Mobile & UI Changes

✅ **Completed**:
- Mobile sizes reduced (font sizes use sm: breakpoints)
- Padding optimized for mobile (px-3 instead of px-4 on mobile)
- "Watch Demo" button changed to "See Pricing"
- Button now links to #pricing section

Visible in: `app/page.tsx`

## Next Steps If Still Broken

1. Share the exact error message from Vercel Runtime Logs
2. Confirm DATABASE_URL is set (check Vercel Settings → Environment Variables)
3. Verify Neon database has the users table (query information_schema)
4. Check if the issue is with IP tracking (maybe countAccountsByIP is failing)

## Performance Improvements Made

- Added specific error context logging with `[v0]` prefix
- Logs show DATABASE_URL existence status
- Identifies schema vs connection issues
- Shows exact line where failure occurs

Use these logs to pinpoint the exact problem!
