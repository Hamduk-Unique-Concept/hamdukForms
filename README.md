# Hamduk Forms - Africa's #1 Form Platform

Build, deploy, and scale powerful forms with AI-powered features, payments, and team collaboration. Optimized for Africa with multi-language support, regional payment methods, and low-bandwidth optimization.

## Features

### Core Form Building
- **Drag-and-Drop Editor** - Intuitive form builder with 40+ field types
- **Conditional Logic** - Show/hide fields based on user responses
- **Multi-Step Forms** - Page breaks and progress tracking
- **Form Templates** - Pre-built templates for common use cases
- **Advanced Validation** - Custom validation rules and error messages
- **Auto-Save** - Automatic form saving as you build

### AI-Powered Features
- **AI Form Generator** - Generate forms from natural language descriptions
- **Field Suggestions** - AI recommends optimal field configurations
- **Response Analysis** - Analyze and summarize form responses with AI
- **Smart Defaults** - Auto-populate recommended settings using AI

### Payments & Monetization
- **Stripe Integration** - Accept credit card payments globally
- **Paystack Integration** - Local payment processing for Africa
- **Payment Fields** - Built-in payment collection forms
- **Transaction Tracking** - Monitor payment history and status
- **Multiple Currencies** - Support for 150+ currencies

### Analytics & Insights
- **Real-Time Dashboard** - Live response counts and metrics
- **Charts & Graphs** - Visual data analysis with Recharts
- **Response Filtering** - Advanced filtering and segmentation
- **Export Data** - Download responses in CSV/Excel format
- **Custom Reports** - Create and schedule custom reports

### Team Collaboration
- **Invite Members** - Add team members with role-based permissions
- **Form Sharing** - Collaborate on form creation and editing
- **Activity Logs** - Track all form changes and team activities
- **Comments** - Add comments to forms and responses
- **Bulk Operations** - Manage multiple forms at once

### Security & Compliance
- **Two-Factor Authentication** - Protect accounts with 2FA
- **SSO Support** - Enterprise single sign-on
- **Data Encryption** - End-to-end encryption for responses
- **GDPR Compliance** - Data privacy and retention controls
- **Audit Logs** - Complete audit trail of all activities

### Email Notifications
- **Resend Integration** - High-delivery email service
- **Custom Templates** - Design custom notification emails
- **Webhook Delivery** - Send webhooks to external services
- **Delivery Logs** - Track email and webhook delivery status

### Integrations
- **Zapier** - Connect to 3000+ apps via Zapier
- **Webhooks** - Custom webhook integration
- **API Access** - REST API for custom integrations
- **OAuth** - OAuth 2.0 for third-party access

### Mobile & PWA
- **Responsive Design** - Works on all devices
- **Progressive Web App** - Install as mobile app
- **Offline Support** - Continue with forms offline
- **Touch-Optimized** - Mobile-first interface design

### Africa Optimization
- **Multi-Language Support** - 10 African languages
- **Regional Currencies** - Support for African currencies
- **Local Payment Methods** - M-Pesa, Paystack, Flutterwave
- **Low-Bandwidth Mode** - Optimized for slow networks
- **Timezone Support** - 54 African countries

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Payments:** Stripe, Paystack
- **Email:** Resend
- **AI:** Groq LLM
- **Caching:** Upstash Redis
- **Search:** Upstash Search
- **Storage:** Vercel Blob

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account
- Resend account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hamduk-forms.git
cd hamduk-forms
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `PAYSTACK_SECRET_KEY` - Paystack secret key
- `RESEND_API_KEY` - Resend API key
- `GROQ_API_KEY` - Groq API key
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Random secret for NextAuth

5. Run migrations:
```bash
pnpm db:migrate
```

6. Start development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` to see your app.

## Project Structure

```
hamduk-forms/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── forms/                    # Public form pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   ├── form-builder/             # Form builder components
│   ├── forms/                    # Form display components
│   └── ui/                       # UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
│   ├── auth.ts                   # Authentication utilities
│   ├── resend-service.ts         # Email service
│   ├── compression.ts            # Data compression
│   └── africa-optimization.ts    # Africa features
├── public/                       # Static files
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
├── scripts/                      # Database scripts
└── package.json                  # Dependencies
```

## Database Schema

See `DATABASE_SETUP.md` for complete schema documentation.

Key tables:
- `users` - User accounts and profiles
- `organizations` - Teams and workspaces
- `forms` - Form definitions and settings
- `form_fields` - Individual form fields
- `form_responses` - User form submissions
- `organization_members` - Team membership
- `payment_transactions` - Payment records
- `webhooks` - Webhook configurations
- `api_keys` - API access tokens

## API Documentation

### Authentication
```bash
POST /api/auth/signup           # Create new account
POST /api/auth/login            # Sign in user
POST /api/auth/logout           # Sign out user
POST /api/auth/refresh           # Refresh session
```

### Forms
```bash
GET /api/forms                   # List forms
POST /api/forms                  # Create form
GET /api/forms/:id               # Get form details
PUT /api/forms/:id               # Update form
DELETE /api/forms/:id            # Delete form
POST /api/forms/:id/responses    # Submit response
GET /api/forms/:id/responses     # Get responses
```

### Teams
```bash
GET /api/team/members            # List team members
POST /api/team/invite            # Invite team member
DELETE /api/team/members/:id     # Remove member
PUT /api/team/members/:id        # Update member role
```

### Analytics
```bash
GET /api/forms/:id/analytics     # Form analytics
GET /api/forms/:id/responses     # Form responses
```

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Generate database types
pnpm db:types

# Run migrations
pnpm db:migrate
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel --prod
```

### Deploy to AWS/GCP/Others

1. Build the application:
```bash
pnpm build
```

2. Deploy the `.next` folder with Node.js runtime
3. Set all environment variables
4. Run migrations in production environment

## Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

### Performance Testing
```bash
pnpm lighthouse
```

## Performance Targets

- **Lighthouse Score:** 90+
- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.5s

## Security

- SSL/TLS encryption for all data in transit
- End-to-end encryption for form responses (optional)
- Regular security audits and penetration testing
- OWASP top 10 compliance
- PCI DSS compliance for payment processing
- GDPR and CCPAssistant privacy compliance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- Email: support@hamduk.forms
- Documentation: https://docs.hamduk.forms
- Community Forum: https://community.hamduk.forms
- Twitter: https://twitter.com/hamduk_forms

## License

MIT License - see LICENSE.md for details

## Roadmap

- Q2 2024: Advanced conditional logic
- Q3 2024: Advanced export options (PDF, Excel)
- Q4 2024: Mobile app (iOS/Android)
- Q1 2025: AI-powered insights
- Q2 2025: Advanced automation (Zapier, Make)

## Acknowledgments

Built with ❤️ for Africa by Hamduk Forms team.

Special thanks to:
- Vercel for Next.js and deployment
- Supabase for database
- Stripe and Paystack for payments
- Resend for email delivery
- Groq for AI capabilities
