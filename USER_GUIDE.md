# SMS Burst - User Quick Guide

## Getting Started

### 1. Sign Up
- Go to `/auth/signup`
- Enter email and password (min 6 characters)
- Confirm password matches
- Click "Create Account"
- You'll receive **5,000 free credits** automatically

### 2. Dashboard Overview
After login, you'll see three tabs:
- **Panel** - Launch SMS attacks
- **Plans** - Buy additional credits
- **Contact** - Support information

---

## Launching an Attack

### Step 1: Enter Target Details
1. Go to **Dashboard → Panel**
2. Enter **Target Phone Number** (10+ digits)
3. Select **Mode**: Normal, Burst, or Flood
4. Enter **Delay** (seconds between messages, e.g., 0.5)
5. Enter **Number of Messages** (how many SMS to send)

### Step 2: Review Credits
- System shows: "Credits Needed: X"
- Formula: 1 message = 1 credit
- If 1000 messages = 1000 credits needed
- Your available credits shown at top

### Step 3: Check for Protected Numbers
- If number is protected, you'll see:
  - Error: "This phone number is protected and cannot receive messages"
  - No credits will be deducted
  - Try a different number

### Step 4: Launch
- Click **"Launch Burst"** button
- Terminal will show real-time logs:
  - "Validating phone number and checking credits..."
  - "Credits check passed | Deducted: X | Remaining: Y"
  - "Launching SMS burst to Render API..."
  - "SUCCESS: Attack started! Job ID: ..."
  - Real-time message count updates

### Step 5: Monitor Progress
- **Live Terminal** shows all actions
- **Status Card** displays:
  - Target number
  - Total messages
  - Delay setting
  - Current mode
  - Running/Completed status

### Step 6: Stop (Optional)
- Click **"Stop"** button to halt ongoing attack
- Terminal will confirm: "Attack stopped"
- Remaining credits won't be refunded

---

## Credit System Explained

### How Credits Work
- 1 credit = 1 message
- Deducted instantly when you launch
- Auto-refunded if attack fails

### Example Calculations
- 100 messages to 1 number = 100 credits
- 5,000 messages to 1 number = 5,000 credits
- 1,000 messages × 5 targets = 5,000 credits per burst

### Free Credits
- New account: 5,000 credits
- No expiration
- No credit card required

### Buying More Credits
1. Go to **Dashboard → Plans**
2. Choose plan:
   - **Starter**: ₹9 for 25,000 credits
   - **Pro**: ₹25 for 50,000 credits
3. Click **"Upgrade"**
4. Scan QR code or complete payment
5. Credits added instantly after payment

---

## Transaction History

### Viewing Your History
1. Visit your profile/transactions section
2. See all past attacks:
   - Launch: -X credits (red)
   - Purchase: +X credits (green)
   - Refund: +X credits (blue)
3. Shows:
   - Date & time
   - Type of transaction
   - Credits changed
   - Target number (for attacks)
   - Message count sent
   - Status (success/failed)

### Example Transaction
```
🚀 Launch
-1000 credits
1000 messages to 9999999999
Success
Mar 15, 2026 at 3:45 PM
```

---

## Modes Explained

### Normal Mode
- Standard message sending
- Default 0.5-1 second delay
- Good for regular campaigns

### Burst Mode
- Faster message delivery
- Shorter delay (0.1-0.5 seconds)
- More aggressive
- Uses same credits

### Flood Mode
- Fastest possible delivery
- Minimal delay (< 0.1 seconds)
- Maximum impact
- Uses same credits

---

## Troubleshooting

### "Insufficient Credits"
- Message: "Need X credits but only have Y"
- Solution: Buy more credits via Plans page
- Cost: ₹9 for 25,000 or ₹25 for 50,000

### "Phone Number is Protected"
- Message: "This phone number is protected and cannot receive messages"
- Reason: Admin has blocked this number
- Solution: Use a different target number
- Note: Credits NOT deducted

### "Attack Failed"
- Credits will be automatically refunded
- Check terminal logs for error details
- Try again with different settings

### "Cannot Create Account"
- Message: "Too many accounts created from this IP address"
- Reason: 3+ accounts created from your IP in short time
- Solution: Wait 24 hours or contact support

### Terminal Shows "ERROR: Protected Number"
- Number is in admin blacklist
- Cannot proceed
- Choose another number

---

## Security Notes

### Keep Safe
- Don't share your password
- Don't share account link
- Log out on shared computers
- Clear browser cookies after use

### VPN/Proxy Users
- Account flagged if using VPN
- Doesn't affect usage, just tracked
- Multiple accounts from same IP blocked

### Device Fingerprinting
- System tracks unique device fingerprints
- For fraud prevention
- Auto-detects suspicious activity

### Suspicious Activity
- If account hacked, contact support
- Login from new IP tracked
- New device flagged for verification

---

## FAQ

### Q: Can I refund my credits?
A: Yes, contact support for refunds within 7 days of purchase.

### Q: What if my attack gets blocked?
A: Credits are automatically refunded. You can retry.

### Q: How many numbers can I target?
A: One number per attack. Use multiple attacks for multiple targets.

### Q: Do credits expire?
A: No, your credits never expire. They're valid forever.

### Q: Can I cancel an attack mid-way?
A: Yes, click the "Stop" button. Remaining time won't be refunded.

### Q: Why is a number protected?
A: Government policy protects certain numbers. Contact support for more info.

### Q: How fast are messages sent?
A: Depends on mode. Normal: 0.5-1s, Burst: 0.1-0.5s, Flood: <0.1s between messages.

### Q: Will the target know it's from me?
A: No, SMS burst uses carrier networks. Sender anonymized.

### Q: Is this legal?
A: SMS testing is legal for authorized numbers only. Misuse violates laws.

---

## Support

### Contact Us
- Email: support@smsburst.in
- Telegram: @smsburst
- Phone: +91 9876543210 (9 AM - 6 PM IST)

### Report Issues
- Use the Contact tab in dashboard
- Include error messages from terminal
- Provide transaction ID from history
- Screenshot of issue if possible

---

**Happy SMS Bursting! Questions? Contact support anytime.**
