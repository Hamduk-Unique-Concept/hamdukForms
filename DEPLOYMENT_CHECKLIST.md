# 🚀 Deployment Checklist

## Pre-Deployment (Before Going Live)

### Build & Testing
- [ ] `pnpm install` - All dependencies installed
- [ ] `pnpm run build` - Build completes without errors
- [ ] `pnpm dev` - Dev server runs
- [ ] Test form creation and saving
- [ ] Test form publishing
- [ ] Test form submission
- [ ] Verify no console errors in browser

### Database Setup
- [ ] Supabase project created
- [ ] Run migration 007: `007-add-integrations-and-payments.sql`
- [ ] Run migration 008: `008-add-form-responses.sql`
- [ ] Verify all tables created
  - [ ] `form_responses`
  - [ ] `user_integrations`
  - [ ] `user_2fa`
  - [ ] `user_sessions`
  - [ ] `user_api_keys`
  - [ ] `webhooks`
  - [ ] `form_publish_links`
  - [ ] `form_response_analytics`
  - [ ] `subscriptions`
  - [ ] `payment_transactions`

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set correctly
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set correctly
- [ ] `RESEND_API_KEY` - Set correctly
- [ ] `PAYSTACK_SECRET_KEY` - Set (use test key first)
- [ ] `NEXT_PUBLIC_APP_URL` - Set to your domain
- [ ] All variables verified in console

### Email Configuration
- [ ] Resend account created
- [ ] Domain verified: `hamduk.com.ng`
- [ ] Sender email: `noreply.forms@hamduk.com.ng`
- [ ] Test email sending
- [ ] Invite email renders correctly

### Payment Configuration
- [ ] Paystack test account created
- [ ] Paystack test keys obtained
- [ ] Test payment flow
- [ ] Verify transaction recording
- [ ] Test subscription creation

### Integration Testing
- [ ] Create a test form
- [ ] Add multiple field types
- [ ] Save draft
- [ ] Publish form
- [ ] Access published form via URL
- [ ] Submit test response
- [ ] Verify response in database
- [ ] Test template selection

### Team Testing
- [ ] Invite team member
- [ ] Verify email received
- [ ] Accept invitation
- [ ] Verify user added to team
- [ ] Test permissions

### Profile Testing
- [ ] Update profile fields
- [ ] Upload profile image
- [ ] Verify data saved to database
- [ ] Test image display

### Security Testing
- [ ] Test auth token in localStorage
- [ ] Verify RLS policies working
- [ ] Test unauthorized access denied
- [ ] Check password requirements

---

## Deployment to Vercel

### Prerequisites
- [ ] GitHub repository connected
- [ ] GitHub account configured
- [ ] Vercel account created

### Configuration
- [ ] Add environment variables in Vercel project settings
- [ ] Enable automatic deployments
- [ ] Set build command: `pnpm run build`
- [ ] Set start command: `pnpm start`

### Deployment Steps
1. [ ] Push code to GitHub
2. [ ] Vercel auto-deploys
3. [ ] Build completes successfully
4. [ ] Domain configured
5. [ ] SSL certificate installed
6. [ ] Test in production

### Post-Deployment
- [ ] Test all features in production
- [ ] Test form submission
- [ ] Test team invitations
- [ ] Test payment flow
- [ ] Monitor error logs

---

## DNS Configuration (For Custom Domain)

If using `forms.hamduk.com.ng`:

- [ ] DNS provider accessed
- [ ] CNAME record added to Vercel
- [ ] DNS propagation verified
- [ ] SSL certificate issued
- [ ] HTTPS working

---

## Email Verification (Resend)

- [ ] Domain `hamduk.com.ng` verified in Resend
- [ ] MX records updated
- [ ] SPF records updated
- [ ] DKIM records updated
- [ ] Test email delivered
- [ ] Check email reputation

---

## Payment Processing Verification

### Paystack
- [ ] Merchant account verified
- [ ] Bank details added
- [ ] Identity verification complete
- [ ] Test transactions working
- [ ] Production keys obtained

### Stripe (If Using)
- [ ] Account verified
- [ ] Bank details added
- [ ] Test mode working
- [ ] Live keys obtained

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] API keys not exposed in client code
- [ ] Service role key only on server
- [ ] Database RLS policies active
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Input validation on all forms

---

## Monitoring & Maintenance

- [ ] Error tracking configured (e.g., Sentry)
- [ ] Log monitoring enabled
- [ ] Performance monitoring setup
- [ ] Backup strategy defined
- [ ] Database backups automated
- [ ] Uptime monitoring configured

---

## Feature Verification Checklist

### Forms
- [ ] Create form works
- [ ] Save draft works
- [ ] Publish form works
- [ ] Public form accessible
- [ ] Submissions saved
- [ ] Analytics tracked

### Team
- [ ] Invite works
- [ ] Email sends
- [ ] Accept invite works
- [ ] User added to team

### Integrations
- [ ] Can list integrations
- [ ] Can connect integration
- [ ] Can disconnect integration
- [ ] Credentials stored securely

### Payments
- [ ] Can view pricing page
- [ ] Can initiate payment
- [ ] Payment processes
- [ ] Subscription created
- [ ] Upgrade page works

### Profile
- [ ] Can update profile
- [ ] Can upload image
- [ ] Data persists
- [ ] Image displays correctly

### Documentation
- [ ] Documentation page loads
- [ ] Links work
- [ ] API docs available
- [ ] Examples provided

---

## Performance Checklist

- [ ] Page load time < 3 seconds
- [ ] Form builder responsive
- [ ] No console errors
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] CSS/JS minified

---

## Backup & Disaster Recovery

- [ ] Database backups enabled
- [ ] Automated backup schedule set
- [ ] Test backup restore
- [ ] Disaster recovery plan documented
- [ ] Contact information recorded

---

## Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] Troubleshooting guide created
- [ ] Team training completed

---

## Launch Preparation

- [ ] Marketing materials ready
- [ ] Launch announcement prepared
- [ ] Customer support team ready
- [ ] Monitoring tools active
- [ ] Incident response plan ready

---

## Post-Launch (First Week)

- [ ] Monitor error logs daily
- [ ] Check analytics
- [ ] Verify payment processing
- [ ] Monitor server performance
- [ ] Respond to user feedback
- [ ] Fix any critical issues
- [ ] Communicate status to team

---

## Continuous Improvement

- [ ] Set up feedback collection
- [ ] Monitor user behavior
- [ ] Plan feature improvements
- [ ] Schedule security audits
- [ ] Plan performance optimizations
- [ ] Document lessons learned

---

## Sign-Off

- [ ] Product Owner Sign-Off: ___________
- [ ] Tech Lead Sign-Off: ___________
- [ ] DevOps Sign-Off: ___________
- [ ] Security Review: ___________

**Launch Date**: ________________
**Deployment Time**: ________________
**Monitored By**: ________________

---

## Emergency Contacts

- **On-Call Engineer**: ________________
- **Database Admin**: ________________
- **Security Officer**: ________________
- **Product Manager**: ________________

---

## Success Metrics

Track these after launch:

- [ ] Uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] Page load time < 2 seconds
- [ ] User sign-ups (target: __)
- [ ] Form submissions (target: __)
- [ ] Revenue (target: __)
- [ ] Customer satisfaction (target: __)

---

**Status**: Ready for deployment when all items checked ✅

Good luck with launch! 🚀
