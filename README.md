# SMSBurst - Launch Render Services Instantly

A modern SaaS platform built with Next.js, Neon PostgreSQL, and Neumorphic Design. SMSBurst makes it effortless to deploy and manage Render services with an intuitive interface and affordable credit system.

## Features

- 🎨 **Neumorphic Design** - Beautiful, tactile UI with red & gold color scheme
- 📱 **Mobile-First** - Fully responsive with Android-optimized bottom navigation
- 🔐 **Secure Authentication** - JWT-based auth with httpOnly cookies
- 💳 **Credit System** - User-friendly credit-based deployment costs
- 🚀 **Render Integration** - Seamless Render API proxy
- 💾 **PostgreSQL Database** - Neon serverless database
- ⚡ **Fast Performance** - Built with Next.js 16 and optimized for mobile

## Tech Stack

- **Frontend**: React 19 + Next.js 16 + Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: JWT + httpOnly cookies
- **Styling**: Neumorphic design with custom CSS utilities
- **Mobile**: Bottom navigation, full-viewport pages, Material Design 3 spacing

## Getting Started

### Prerequisites

- Node.js 18+ (pnpm recommended)
- Neon Database account and connection string
- Render API key (for production)

### Installation

1. **Clone and Install Dependencies**
```bash
npm install
# or
pnpm install
```

2. **Set Up Environment Variables**

Create a `.env.local` file:
```env
DATABASE_URL=your_neon_connection_string
RENDER_API_KEY=your_render_api_key
JWT_SECRET=your_jwt_secret_key
```

3. **Initialize Database**

The database schema is created automatically on first run. The tables include:
- `users` - User accounts with credit tracking
- `campaigns` - Deployment campaigns
- `credit_transactions` - Payment history
- `sessions` - Session management

4. **Run Development Server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
/app
  /api
    /auth - Authentication endpoints
    /campaigns - Campaign management
    /credits - Credit system
    /render - Render proxy endpoints
  /dashboard - Protected user dashboard
  /auth - Public auth pages
  /page.tsx - Landing page
/lib
  /auth.ts - JWT & password utilities
  /db.ts - Database functions
  /useAuth.ts - Auth hook
/scripts
  /init-db.sql - Database schema
```

## Key Features

### Authentication
- Secure signup/login with password hashing
- JWT tokens in httpOnly cookies
- Automatic token verification
- 7-day session expiry

### Dashboard
- Mobile-first with bottom navigation tabs
- Real-time credit display
- Campaign management
- Billing history

### Campaigns
- Create and track service deployments
- Cost preview (10 credits per deployment)
- Status tracking (pending, active, failed)

### Billing
- Multiple credit packages
- Transaction history
- WhatsApp payment integration (configurable)
- Credit purchase tracking

### Design System
- Red (#C41E3A) primary color
- Gold (#D4AF37) accent color
- Warm beige (#F5F5F0) background
- Neumorphic shadows and embossed elements
- Optimized for mobile touch targets

## Color Palette

| Color | Purpose | Value |
|-------|---------|-------|
| Red | Primary brand | #C41E3A |
| Gold | Accent/Secondary | #D4AF37 |
| Beige | Background | #F5F5F0 |
| White | Surface | #FAFAF8 |
| Gray | Text | #2C2C2C |

## Mobile Optimization

- Bottom navigation bar for easy thumb reach
- 48px+ touch targets
- Full-viewport pages
- Material Design 3 spacing
- Responsive typography
- Optimized for 375-430px viewports

## API Routes

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign

### Credits
- `GET /api/credits/transactions` - Transaction history
- `POST /api/credits/purchase` - Purchase credits
- `POST /api/render/deploy` - Deploy service (deducts credits)

## Development Notes

### Adding New Features
1. Create database migration if needed
2. Add API routes in `/app/api`
3. Create UI pages in `/app/dashboard`
4. Use the `useAuth()` hook for auth state
5. Follow neumorphic design patterns

### Database Queries
Use the helper functions in `/lib/db.ts`:
```typescript
import { getUser, createCampaign, addCredits } from '@/lib/db';
```

### Authentication in Components
```typescript
import { useAuth } from '@/lib/useAuth';

function MyComponent() {
  const { user, login, logout, signup } = useAuth();
  // ...
}
```

## Production Deployment

1. **Update secrets**: Set all env vars in Vercel dashboard
2. **Database**: Connect to Neon PostgreSQL
3. **Payment**: Integrate with Stripe or payment gateway
4. **Render API**: Configure real API credentials
5. **Security**: Enable CORS, rate limiting, input validation

## Security Considerations

- JWT tokens stored in httpOnly cookies (CSRF safe)
- Password hashing with PBKDF2 (use bcrypt in production)
- SQL injection prevention via parameterized queries
- Input validation on all API routes
- User-specific data access via JWT verification

## Future Enhancements

- [ ] Two-factor authentication
- [ ] API key management
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Team/organization support
- [ ] Usage-based billing
- [ ] Real-time notifications

## Support & Contact

For issues, feature requests, or questions:
- Email: support@smsburst.app
- WhatsApp: Your support number
- Documentation: https://docs.smsburst.app

## License

MIT License - feel free to use this project as a template for your own SaaS!
