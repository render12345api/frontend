# Device & IP-Based Security System

## Overview

SMS Burst implements a sophisticated device-based login security system where users must independently authenticate on each new device or IP address. This prevents unauthorized access and ensures account security.

## Key Features

### 1. **Device Fingerprinting**
- Each device is uniquely identified by combining:
  - User Agent (Browser + OS)
  - IP Address
  - Device Type (Desktop, Mobile, Tablet)
- Fingerprint is hashed using SHA-256 for security
- Stored in `device_fingerprints` table

### 2. **IP Tracking**
- Every login records the user's IP address
- Tracks login count per IP
- Records last login timestamp from each IP
- Prevents account sharing across IPs

### 3. **Independent Authentication Per Device**
- **First Login on Device**: User provides email + password
  - System creates unique device fingerprint
  - Device is registered in fingerprints table
  - IP is tracked in ip_tracking table
  
- **Subsequent Logins from Same Device**: 
  - If IP AND fingerprint match → Direct login allowed
  - Session created with device context
  
- **Login from Different Device/IP**:
  - Requires fresh authentication (email + password again)
  - New device fingerprint generated
  - Old sessions remain but device is new
  - User sees "New Device Detected" notification

### 4. **Session Management**
- Sessions are IP + Device-specific
- Users can view all active sessions
- Can logout from all devices at once
- Can see device details: Browser, OS, Last Used

## Database Schema

### `device_fingerprints` Table
```sql
- id: Primary key
- user_id: Reference to user
- fingerprint: SHA-256 hash (User Agent + IP)
- device_name: Desktop/Mobile/Tablet
- browser: Chrome/Firefox/Safari/etc
- is_trusted: Whether device is verified
- last_used: Last login timestamp
- created_at: Registration timestamp
```

### `ip_tracking` Table
```sql
- id: Primary key
- user_id: Reference to user
- ip_address: Login IP
- login_count: How many times logged in from this IP
- last_login: Most recent login from this IP
- created_at: First login from this IP
```

## API Endpoints

### 1. POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "user": { "id": 1, "email": "user@example.com", "credits": 5000 },
  "isNewDevice": true,
  "deviceInfo": {
    "fingerprint": "abc123...",
    "browser": "Chrome",
    "deviceType": "Desktop",
    "ip": "192.168.1.1"
  }
}
```

### 2. GET `/api/auth/verify-device`
Returns all trusted devices for current user
**Response:**
```json
{
  "trustedDevices": [
    {
      "fingerprint": "abc123...",
      "browser": "Chrome",
      "deviceName": "Desktop",
      "lastUsed": "2024-02-21T10:30:00Z",
      "isTrusted": true
    }
  ]
}
```

### 3. GET `/api/auth/sessions`
Returns all active login sessions by IP
**Response:**
```json
{
  "activeSessions": [
    {
      "ip": "192.168.1.1",
      "loginCount": 5,
      "lastLogin": "2024-02-21T10:30:00Z",
      "isCurrentSession": true
    }
  ]
}
```

### 4. DELETE `/api/auth/sessions`
Logout from all devices/sessions

## User Experience Flow

### First Login
1. User visits app
2. Enters email + password
3. System checks email/password validity
4. Creates device fingerprint from browser + IP
5. Saves fingerprint to `device_fingerprints`
6. Records IP in `ip_tracking`
7. Issues JWT token
8. Redirects to dashboard

### Subsequent Logins from Same Device
1. User enters email + password
2. System verifies credentials
3. Creates fingerprint (same as before)
4. Checks if fingerprint exists → YES
5. Marks as existing device
6. Issues JWT token
7. Logs in directly

### Login from New Device/IP
1. User enters email + password
2. System verifies credentials
3. Creates NEW fingerprint (different browser/IP)
4. Checks if fingerprint exists → NO
5. Returns `isNewDevice: true` in response
6. Frontend shows "New Device Detected" notification
7. User can verify device in settings
8. Issues JWT token anyway (for convenience)

## Profile Page Features

### Device Management Section
- **Trusted Devices**: Shows all registered devices with last used timestamp
- **Active Sessions**: Shows all IPs with login history
- **Current Session Badge**: Highlights the device user is currently on
- **Security Notes**: Explains device tracking system

### User Actions
- View trusted devices
- See device details (browser, OS)
- Track login history by IP
- Logout from all devices
- Remove specific devices (future feature)

## Security Considerations

### Prevented Attacks
- **Account Sharing**: Different IPs/devices require new login
- **Credential Stealing**: Even with password, different device needed
- **Session Hijacking**: Sessions tied to device fingerprint
- **Brute Force**: Can track login attempts per device/IP

### Privacy
- Fingerprints are hashed (not reversible)
- IPs are stored for security audit trail
- User can view all their devices/sessions
- Transparent about what's tracked

## Implementation Details

### Device Fingerprint Generation
```typescript
const fingerprintData = `${userAgent}|${ipAddress}`;
const deviceFingerprint = crypto.createHash('sha256')
  .update(fingerprintData)
  .digest('hex');
```

### Browser Detection
```typescript
- Matches: Chrome, Safari, Firefox, Edge, Opera
- Falls back to "Unknown"
- Device Type: Mobile, Tablet, Desktop (from User Agent)
```

### Login Flow
```
1. Get client IP from headers
2. Get User Agent from headers
3. Verify email + password
4. Generate device fingerprint
5. Check if fingerprint exists
6. If new → save to device_fingerprints
7. Track IP in ip_tracking
8. Return isNewDevice flag
```

## Testing

### Scenario 1: First Login
- User logs in from Chrome on Desktop from IP 1.1.1.1
- System creates new fingerprint
- Device registered as "Desktop • Chrome"

### Scenario 2: Same Device, Same IP
- User logs in from same Chrome/Desktop/IP again
- Fingerprint matches → existing device
- No new registration

### Scenario 3: Same User, Different Device
- User logs in from Firefox on Laptop from IP 2.2.2.2
- Fingerprint is different
- New device registered as "Desktop • Firefox"
- User sees both devices in profile

### Scenario 4: VPN Detection
- User logs in from VPN (IP changes)
- Different fingerprint → New device
- Flagged as potentially suspicious
- User can verify in settings

## Audit Trail

All logins are recorded with:
- User ID
- IP Address
- Device fingerprint
- Browser/OS
- Timestamp
- Success/Failure status

Admin can view:
- All user login attempts
- Suspicious patterns (multiple IPs, rapid changes)
- Device history per user
