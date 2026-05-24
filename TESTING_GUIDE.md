# Hamduk Forms - Testing Guide

## Testing Overview

This document provides comprehensive testing procedures for all features of Hamduk Forms.

## Test Categories

### 1. Authentication Testing

#### Sign Up Flow
- [ ] Navigate to `/auth/signup`
- [ ] Enter valid email and password
- [ ] Verify confirmation email received
- [ ] Click confirmation link
- [ ] Verify user can log in
- [ ] Test invalid email format
- [ ] Test weak password
- [ ] Test existing email

#### Sign In Flow
- [ ] Navigate to `/auth/login`
- [ ] Enter valid credentials
- [ ] Verify redirect to dashboard
- [ ] Test invalid password
- [ ] Test non-existent user
- [ ] Test remember me functionality

#### Session Management
- [ ] Test session persistence on page refresh
- [ ] Test logout functionality
- [ ] Test session timeout after inactivity
- [ ] Test session across multiple tabs

### 2. Form Builder Testing

#### Form Creation
- [ ] Create new form from dashboard
- [ ] Verify form title and description saved
- [ ] Test form slug generation
- [ ] Test form duplication
- [ ] Test form deletion with confirmation

#### Field Management
- [ ] Add text field
- [ ] Add email field
- [ ] Add phone field
- [ ] Add select field with options
- [ ] Add checkbox field
- [ ] Add radio button field
- [ ] Add textarea field
- [ ] Add date/time field
- [ ] Add file upload field
- [ ] Add payment field
- [ ] Reorder fields via drag-drop
- [ ] Delete field
- [ ] Edit field properties

#### Field Validation
- [ ] Set field as required
- [ ] Add custom validation message
- [ ] Test email validation
- [ ] Test phone format validation
- [ ] Test number range validation
- [ ] Test character length validation

#### Conditional Logic
- [ ] Add conditional rule
- [ ] Test show field on condition
- [ ] Test hide field on condition
- [ ] Test multiple conditions
- [ ] Test nested conditions
- [ ] Test condition with payment

### 3. Form Publishing & Sharing

#### Publishing
- [ ] Generate public form URL
- [ ] Verify form is accessible via URL
- [ ] Test form response collection
- [ ] Test form close/expiration
- [ ] Test form password protection

#### Sharing
- [ ] Share form link via email
- [ ] Share form with team members
- [ ] Set edit permissions
- [ ] Set view-only permissions
- [ ] Revoke share access

### 4. Payments Testing

#### Stripe Integration
- [ ] Add payment field to form
- [ ] Set payment amount
- [ ] Test payment processing with test card
- [ ] Verify payment success notification
- [ ] Test payment failure handling
- [ ] Verify transaction recorded in database

#### Paystack Integration
- [ ] Add payment field
- [ ] Set payment amount in local currency
- [ ] Test payment with test credentials
- [ ] Verify payment success
- [ ] Test payment failure
- [ ] Verify transaction recorded

### 5. Email Notifications Testing

#### Resend Integration
- [ ] Configure email notifications
- [ ] Submit form response
- [ ] Verify email received
- [ ] Check email formatting
- [ ] Test multiple recipient emails
- [ ] Test custom email templates
- [ ] Verify delivery logs

### 6. Analytics Testing

#### Dashboard Metrics
- [ ] Verify response count display
- [ ] Check completion rate calculation
- [ ] Verify average completion time
- [ ] Check submission time chart
- [ ] Test response status breakdown

#### Response Filtering
- [ ] Filter responses by date range
- [ ] Filter responses by field value
- [ ] Filter responses by payment status
- [ ] Test response export to CSV
- [ ] Test response export to Excel

### 7. Team Collaboration Testing

#### Team Management
- [ ] Invite team member
- [ ] Verify invitation email sent
- [ ] Accept team invitation
- [ ] Set member permissions
- [ ] Update member role
- [ ] Remove team member
- [ ] Verify activity log

#### Form Permissions
- [ ] Test editor role permissions
- [ ] Test viewer role permissions
- [ ] Test admin role permissions
- [ ] Verify permission restrictions

### 8. Security Testing

#### Two-Factor Authentication
- [ ] Enable 2FA
- [ ] Verify authenticator setup
- [ ] Test login with 2FA
- [ ] Test backup codes
- [ ] Disable 2FA

#### API Keys
- [ ] Generate API key
- [ ] Test API key authentication
- [ ] Revoke API key
- [ ] Verify revoked key rejection

### 9. Mobile & PWA Testing

#### Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)
- [ ] Test form submission on mobile
- [ ] Test navigation on mobile

#### PWA Features
- [ ] Test add to home screen
- [ ] Test offline form viewing
- [ ] Test service worker installation
- [ ] Test app manifest
- [ ] Test offline sync

### 10. Performance Testing

#### Load Testing
- [ ] Load form builder with 100+ fields
- [ ] Load form with 10,000+ responses
- [ ] Load dashboard with 100+ forms
- [ ] Monitor Core Web Vitals
- [ ] Monitor API response times

#### Network Performance
- [ ] Test on slow 4G
- [ ] Test on 3G
- [ ] Test on 2G
- [ ] Test with data saver enabled
- [ ] Verify compression effectiveness

### 11. Browser Compatibility

#### Desktop Browsers
- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest

#### Mobile Browsers
- [ ] Safari iOS 14+
- [ ] Chrome Android 10+
- [ ] Firefox Android
- [ ] Samsung Internet

### 12. Integration Testing

#### Webhooks
- [ ] Create webhook URL
- [ ] Submit form response
- [ ] Verify webhook delivery
- [ ] Check webhook payload
- [ ] Test webhook retry logic
- [ ] Verify webhook logs

#### API Integration
- [ ] Test form creation via API
- [ ] Test response submission via API
- [ ] Test form retrieval via API
- [ ] Test authentication via API
- [ ] Test error handling

## Test Data

### Valid Test Data
```
Email: test@example.com
Phone: +234-800-000-0000
Payment: 4242424242424242 (Stripe test card)
```

### Invalid Test Data
```
Email: invalid-email
Phone: 12345
Password: weak
```

## Automated Testing Commands

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test -- forms

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch

# E2E tests
pnpm test:e2e

# Performance tests
pnpm test:performance
```

## Performance Benchmarks

| Metric | Target | Status |
|--------|--------|--------|
| FCP | < 1.8s | ✓ |
| LCP | < 2.5s | ✓ |
| CLS | < 0.1 | ✓ |
| TTI | < 3.5s | ✓ |
| Lighthouse | > 90 | ✓ |

## Known Issues & Limitations

- None currently documented

## Reporting Issues

Found a bug? Please create an issue with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device info
5. Screenshots/videos
