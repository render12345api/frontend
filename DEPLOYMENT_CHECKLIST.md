# SMS Burst - Deployment Checklist

## Pre-Deployment

- [ ] Read `FINAL_IMPLEMENTATION.md` for complete overview
- [ ] Ensure all dependencies are installed: `pnpm install`
- [ ] Test locally: `pnpm dev`
- [ ] Database migrations ready in `scripts/init-db.sql`

## Environment Setup

Set these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `DATABASE_URL` = Your Neon PostgreSQL connection string
  ```
  postgresql://user:password@host.neon.tech/database?sslmode=require
  ```
  
- [ ] `JWT_SECRET` = Generate random 32-char string
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  
- [ ] `MASTER_API_KEY` = Admin API key (e.g., your_secret_key_123)

- [ ] `NODE_ENV` = "production"

## Database Setup

1. [ ] Go to Neon console: https://console.neon.tech
2. [ ] Open SQL editor
3. [ ] Copy entire content of `/scripts/init-db.sql`
4. [ ] Execute the SQL script
5. [ ] Verify tables created:
   - `users`
   - `transactions`
   - `ip_tracking`
   - `device_fingerprints`
   - `blacklist`
   - `api_keys`
   - `sessions`
   - `campaigns`

## Code Deployment

1. [ ] Push code to GitHub/repository
   ```bash
   git add .
   git commit -m "Deploy SMS Burst v1"
   git push
   ```

2. [ ] Trigger Vercel deployment automatically, or manually:
   - Go to Vercel Dashboard
   - Select project
   - Click "Deploy"

3. [ ] Wait for build to complete (5-10 minutes)

4. [ ] Check build logs for errors (should see "Build successful")

## Post-Deployment Verification

### Test Signup Flow
- [ ] Visit https://your-domain/auth/signup
- [ ] Create test account with email
- [ ] Verify account created with 5,000 free credits
- [ ] Check IP was tracked
- [ ] Verify JWT token in cookies

### Test Panel Interface
- [ ] Login with test account
- [ ] Go to Dashboard → Panel tab
- [ ] Enter test phone number (e.g., 9999999999)
- [ ] Enter message count (e.g., 100)
- [ ] Verify: "100 credits needed" shows
- [ ] Click "Launch Burst"
- [ ] Verify terminal logs appear with timestamps
- [ ] Check credits were deducted

### Test Protected Numbers
- [ ] Block a test number via admin API:
  ```bash
  curl -X POST https://your-domain/api/admin/block-phone \
    -H "X-API-Key: YOUR_MASTER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"action": "block", "phoneNumber": "1234567890", "reason": "Test"}'
  ```

- [ ] Try launching attack on blocked number
- [ ] Verify error: "This phone number is protected and cannot receive messages"
- [ ] Verify no credits deducted (call should fail before deduction)

### Test Transaction History
- [ ] Go to Dashboard profile
- [ ] Create a component to display `<TransactionHistory />`
- [ ] Verify all past attacks show in history
- [ ] Check timestamps are correct

### Test Plans Page
- [ ] Go to Dashboard → Plans tab
- [ ] Verify three plans show (Free, Starter, Pro)
- [ ] Verify pricing in Indian Rupees (₹9, ₹25)
- [ ] Verify QR code displays from /public/qr.png

## Admin Operations

### Initial Admin Setup
- [ ] Note your MASTER_API_KEY from environment
- [ ] Test admin endpoint access:
  ```bash
  curl -X GET https://your-domain/api/admin/block-phone \
    -H "X-API-Key: YOUR_MASTER_API_KEY"
  ```
  Response should be: `{"success": true, "blockedNumbers": [], "count": 0}`

### Block Important Numbers (Recommended)
- [ ] Create list of numbers to protect (VIP, government, support)
- [ ] Block each via API (see script above)
- [ ] Verify they're protected

## Security Verification

- [ ] IP tracking working: Check `ip_tracking` table has entries
- [ ] VPN detection flag: Create account via VPN, check `is_vpn_detected`
- [ ] Multi-account prevention: Try creating 4 accounts from same IP, 4th should fail
- [ ] Device fingerprinting: Check `device_fingerprints` table populated
- [ ] All API routes have `export const dynamic = 'force-dynamic'`
- [ ] JWT validation on protected endpoints works
- [ ] HTTPS enforced (auto in production on Vercel)

## Monitoring & Logs

- [ ] Check Vercel Analytics: Deployments > Select Deployment > Logs
- [ ] Check database logs in Neon: Monitoring tab
- [ ] Set up alerts for errors (Vercel dashboard)
- [ ] Monitor credit transactions daily

## Performance Checklist

- [ ] Page loads in < 3 seconds
- [ ] Terminal logs update in real-time (< 100ms)
- [ ] Database queries complete in < 500ms
- [ ] Vercel Functions scale correctly under load

## Rollback Plan

If issues occur:
1. [ ] Check error logs in Vercel
2. [ ] Rollback to previous deployment: Vercel Dashboard > Deployments > Previous > Rollback
3. [ ] Or redeploy from git: `git push`

## Post-Launch Monitoring

- [ ] Monitor error rate (should be < 1%)
- [ ] Check database storage usage
- [ ] Review transaction logs daily for fraud
- [ ] Monitor blocked number requests
- [ ] Track user signup rate

## Go Live Checklist

- [ ] All tests passing
- [ ] DNS configured (domain pointing to Vercel)
- [ ] SSL certificate active (auto on Vercel)
- [ ] Backup of environment variables saved securely
- [ ] Admin knows MASTER_API_KEY (stored securely)
- [ ] Contact page has correct support info
- [ ] Terms of service reviewed
- [ ] Privacy policy in place

---

## Troubleshooting Common Issues

### "Database connection failed"
- Check DATABASE_URL in Vercel environment
- Ensure Neon cluster is running
- Test connection: `psql $DATABASE_URL`

### "Static export error on /api/auth/me"
- Verify `export const dynamic = 'force-dynamic'` is in route file
- Clear Next.js cache: Delete `.next/` folder
- Redeploy

### "Credits not deducting"
- Check `/api/credits/deduct` endpoint returns 200
- Verify database transaction was recorded
- Check user has sufficient credits

### "Blocked numbers not working"
- Verify number was added to blacklist table
- Query: `SELECT * FROM blacklist WHERE phone = '...'`
- Ensure phone number format matches (10-15 digits)

### "Render API calls failing"
- Verify `https://sms-burst-api-2.onrender.com` is accessible
- Check X-API-Key is "render12345"
- Verify JSON payload format matches

---

**Deployment Guide Complete. Follow checklist for smooth launch!**
