# SMS Burst Credit System

## Overview
The SMSBurst platform uses a message-based credit system where credits are deducted based on the number of SMS messages sent in a campaign.

## Credit Calculation
- **Rate**: 10 credits per 1,000 messages
- **Formula**: `Credits Needed = ceil(Message Count / 1000) × 10`
- **Examples**:
  - 500 messages = 5 credits
  - 1,000 messages = 10 credits
  - 5,000 messages = 50 credits
  - 12,000 messages = 120 credits

## Pricing Plans

| Plan | Messages | Credits | Price (₹) |
|------|----------|---------|-----------|
| Basic | 12,000 | 120 | ₹9 |
| Pro | 36,000 | 360 | ₹29 |
| Enterprise | 55,000 | 550 | ₹49 |

## How It Works

### 1. Create Campaign
When creating a new campaign, users specify:
- Campaign name
- Description
- Render service ID
- **Number of messages** (NEW)

The system automatically calculates the credits needed based on the message count.

### 2. Deduction on Launch
When launching a campaign, the system:
1. Validates the user has enough credits
2. Calculates credits needed: `ceil(messageCount / 1000) × 10`
3. Deducts credits from user account
4. Records transaction with message count and credit deduction
5. Launches deployment on Render

### 3. Refunds on Failure
If deployment fails for any reason:
1. All deducted credits are automatically refunded
2. Transaction is recorded as "Refund: Deployment failed"
3. Campaign status is updated to "failed"

## Database Updates

The campaigns table includes:
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  message_count INT,           -- NEW: Number of SMS messages
  render_service_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Changes

### POST /api/render/deploy

**Request Body**:
```json
{
  "campaignId": "123",
  "renderServiceId": "srv_xxx",
  "messageCount": 5000
}
```

**Response**:
```json
{
  "success": true,
  "message": "Deployment initiated successfully",
  "messageCount": 5000,
  "creditsDeducted": 50,
  "deploymentId": "deploy_xxx"
}
```

## Transaction History

Users can view all transactions in the Billing dashboard:
- **Purchase**: Credit purchase (positive amount)
- **Deduction**: Campaign launch (negative amount with message count)
- **Refund**: Failed deployment refund (positive amount)

Example transaction:
```
Campaign deployment: My Service (5,000 messages) | Deduction | -50 credits
```

## Changes Made

### Files Updated:
1. **app/dashboard/billing/page.tsx**
   - Updated pricing plans to ₹9, ₹29, ₹49
   - Changed display from "credits" to "messages"
   - Shows credit equivalents for each plan

2. **app/dashboard/campaigns/new/page.tsx**
   - Added message count input field
   - Real-time credit calculation display
   - Validation for message count

3. **app/dashboard/campaigns/page.tsx**
   - Displays message count in campaign list
   - Shows campaign details with message info

4. **app/api/render/deploy/route.ts**
   - Accepts `messageCount` parameter
   - Calculates credits dynamically
   - Records transaction with message count
   - Automatic refunds on failure

## Benefits

✅ **Usage-Based Pricing**: Pay only for what you send  
✅ **Transparent Costs**: Real-time credit calculation  
✅ **Automatic Refunds**: No penalties for failed deployments  
✅ **Clear Audit Trail**: Detailed transaction history  
✅ **Flexible Plans**: Choose the plan that fits your needs
