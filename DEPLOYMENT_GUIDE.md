# Hamduk Forms - Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] All linting errors resolved
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backup of production data
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Setup

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel:
   - Visit https://vercel.com/new
   - Select your git provider
   - Select your repository
   - Click Import

3. Configure environment variables:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`

4. Configure database:
   - Ensure Supabase is accessible
   - Run migrations:
     ```bash
     vercel env pull
     pnpm db:migrate
     ```

#### Deploy

```bash
# Deploy to production
vercel --prod

# Deploy to staging
vercel --prod=false

# Check deployment status
vercel --status
```

#### Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  "env": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "PAYSTACK_SECRET_KEY",
    "RESEND_API_KEY",
    "GROQ_API_KEY",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET"
  ],
  "functions": {
    "api/**": {
      "maxDuration": 30
    }
  }
}
```

### Option 2: AWS

#### EC2 Deployment

1. Launch EC2 instance:
   ```bash
   # Recommended: t3.medium or larger
   # OS: Ubuntu 22.04 LTS
   ```

2. Install dependencies:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   npm install -g pnpm
   ```

3. Clone and setup:
   ```bash
   git clone <your-repo>
   cd hamduk-forms
   pnpm install
   pnpm build
   ```

4. Setup environment:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

5. Run with PM2:
   ```bash
   pnpm global add pm2
   pm2 start npm --name "hamduk" -- start
   pm2 save
   pm2 startup
   ```

6. Setup Nginx reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["pnpm", "start"]
```

#### Build & Run

```bash
# Build image
docker build -t hamduk-forms:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  # ... other env vars
  hamduk-forms:latest
```

### Option 4: Docker Compose

```yaml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      # ... other env vars
    depends_on:
      - postgres
    networks:
      - hamduk

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: hamduk
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hamduk

volumes:
  postgres_data:

networks:
  hamduk:
```

## Environment Variables for Production

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-`openssl rand -base64 32`

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Groq
GROQ_API_KEY=...

# Optional Services
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Optional for CDN
BLOB_READ_WRITE_TOKEN=...
```

## Database Migrations

### Pre-Deployment

1. Test migrations locally:
   ```bash
   pnpm db:migrate
   ```

2. Backup production database:
   ```bash
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

3. Run migrations in staging:
   ```bash
   DATABASE_URL=$STAGING_DB_URL pnpm db:migrate
   ```

### Production Migration

```bash
# Run migrations
pnpm db:migrate

# Verify schema
pnpm db:types

# Rollback if needed (keep this for emergency)
pnpm db:rollback
```

## SSL/TLS Certificate

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### Configure Nginx with SSL

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Application Monitoring

```bash
# Monitor with PM2
pm2 monit

# View logs
pm2 logs hamduk

# Restart on crash
pm2 restart hamduk
```

### Error Tracking

Setup Sentry:

```bash
# Install
pnpm add @sentry/nextjs

# Configure in next.config.js
// See Sentry documentation
```

### Performance Monitoring

```bash
# Use New Relic, Datadog, or similar
# Add monitoring SDK to your app
```

## Scaling

### Horizontal Scaling

1. Load Balancer Setup:
   - Use AWS ELB, nginx, or similar
   - Configure sticky sessions for auth
   - Health check endpoint: `/health`

2. Database Connection Pooling:
   ```bash
   # Use PgBouncer for connection pooling
   # Configuration in pgbouncer.ini
   ```

3. Redis Caching:
   - Use Upstash or Redis Cloud
   - Cache frequently accessed data
   - Session storage

### Vertical Scaling

Increase server resources:
- CPU: t3.large or larger
- RAM: 4GB minimum, 8GB+ recommended
- Storage: SSD with at least 50GB free

## Backup & Recovery

### Automated Backups

```bash
# Supabase handles automated backups
# Check Supabase dashboard for backup schedule

# Manual backup
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Disaster Recovery

```bash
# Restore from backup
gunzip < backup-file.sql.gz | psql $DATABASE_URL
```

## Post-Deployment

- [ ] Verify all services running
- [ ] Check logs for errors
- [ ] Run smoke tests
- [ ] Monitor performance
- [ ] Setup alerts
- [ ] Notify users
- [ ] Document deployment

## Rollback Plan

If issues occur:

```bash
# Vercel: Automatic rollback via dashboard
# Manual: Redeploy previous version
git revert <commit-hash>
git push

# Database: Use backup from before migration
pg_restore $DATABASE_URL < backup-file.sql
```

## Support

Contact deployment support:
- Email: devops@hamduk.forms
- Slack: #deployment channel
