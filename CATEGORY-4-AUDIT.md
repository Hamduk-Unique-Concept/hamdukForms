# Category 4: Payments & Commerce - Comprehensive Audit Report

## Executive Summary
This document provides a detailed audit of Payment & Commerce features in Hamduk Forms comparing **what exists** vs **what's required** from the specification. The project has a solid foundation with 50-60% of core payment features implemented. Major gaps exist in advanced features like installment plans, refund management, and specialized payment scenarios.

---

## PART 1: FEATURES ALREADY IMPLEMENTED

### Database Tables (Migrations Executed)
✅ **payment_accounts** - Stores payment provider credentials (Paystack, Flutterwave, PayPal, Stripe)
✅ **payments** - Core payment records with status tracking, currency, provider info
✅ **invoices** - Invoice generation with tracking, numbering, and status management
✅ **api_keys** - API key management for third-party integrations
✅ **webhooks** - Webhook configuration and event routing
✅ **webhook_logs** - Webhook delivery tracking and retry logic
✅ **form_settings** - Form-level settings including payment configuration
✅ **form_analytics** - Revenue tracking and form-level analytics
✅ **field_analytics** - Field-level engagement metrics
✅ **response_statuses** - Response status pipeline and assignment

### Frontend Components (UI)
✅ **payment-gateway-manager.tsx** - Configuration UI for Paystack, Flutterwave, PayPal, Stripe with test/live modes
✅ **pricing-engine.tsx** - Dynamic pricing rules (quantity-based, value-based, country-based, user-type-based, time-based)
✅ **booking-system.tsx** - Booking/appointment scheduling with time slots, capacity management, and pricing
✅ **invoice-generator.tsx** - Invoice creation with line items, tax calculation, and PDF export
✅ **cart-system.tsx** - Shopping cart with product management, tax, and optional shipping
✅ **tax-currency-calculator.tsx** - Multi-currency support (NGN, USD, EUR, GBP, KES, UGX, GHS) with custom tax rules
✅ **form-canvas.tsx** - Payment field type rendering (payment, product, pricing, booking, ticket, inventory, subscription, bundle)
✅ **field-palette.tsx** - 8 payment field types available in form builder

### Backend APIs
✅ **POST /api/payments/initialize** - Initialize payment with Paystack
✅ **POST /api/payments/verify** - Verify payment status
✅ **POST /api/payments/paystack** - Paystack-specific operations
✅ **POST /api/payments/stripe** - Stripe integration
✅ **POST /api/payments/tax-currency** - Tax calculation and currency conversion
✅ **POST /api/pricing/calculate** - Dynamic pricing calculation engine
✅ **POST /api/invoices/generate** - PDF invoice generation
✅ **POST /api/checkout/save** - Checkout session management
✅ **POST /api/payments/gateways/paystack** - Paystack gateway setup/verification
✅ **POST /api/payments/gateways/flutterwave** - Flutterwave gateway setup/verification
✅ **POST /api/payments/gateways/paypal** - PayPal gateway setup/verification
✅ **POST /api/payment-providers/connect** - Connect payment provider
✅ **POST /api/payment-providers/disconnect** - Disconnect payment provider
✅ **POST /api/payment-providers/setup** - Setup payment provider configuration

### Form Builder Features
✅ Payment field types added to field palette with proper grouping
✅ Dynamic pricing engine with configurable rules
✅ Booking system with slot-based scheduling
✅ Invoice generation support in form settings
✅ Multi-currency handling across all payment components
✅ Tax calculation framework integrated

### Key Capabilities
✅ One-time fixed amount payment collection
✅ Variable pricing based on form responses
✅ Paystack, Flutterwave, PayPal integration ready
✅ Stripe integration hooks available
✅ Multi-currency support (8+ currencies)
✅ Tax calculation (VAT, sales tax)
✅ Invoice generation and tracking
✅ Booking/appointment scheduling
✅ Dynamic pricing with rules engine

---

## PART 2: FEATURES NOT YET IMPLEMENTED

### Critical Payment Features (High Priority)

#### 1. DONATION / RESPONDENT-ENTERED AMOUNT
- [ ] Variable amount input field in payment form
- [ ] Min/max amount validation
- [ ] Suggested amounts display
- **Impact**: Medium | **Complexity**: Low
- **What's needed**: 
  - Form field validation for custom amounts
  - Payment flow adjustment to accept dynamic amounts

#### 2. DISCOUNT CODES / PROMO CODES
- [ ] Promo code database table
- [ ] Discount code validation API
- [ ] Percentage discount application
- [ ] Fixed amount discount application
- [ ] Early-bird pricing (discount before a date)
- [ ] Promo code expiry management
- [ ] Usage limit per code
- **Impact**: High | **Complexity**: Medium
- **What's needed**: 
  - New table: `promo_codes` with validation logic
  - Discount calculation in pricing engine
  - Code validation API endpoint
  - Frontend: Promo code input component

#### 3. PARTIAL PAYMENT / DEPOSIT OPTION
- [ ] Deposit amount configuration (% or fixed)
- [ ] Payment plan setup
- [ ] Balance tracking
- [ ] Follow-up payment reminders
- **Impact**: Medium | **Complexity**: Medium
- **What's needed**: 
  - Table: `partial_payments` with installment tracking
  - Logic to calculate remaining balance
  - Payment reminder automation

#### 4. INSTALLMENT PAYMENT PLANS
- [ ] Plan creation (3-month, 6-month, 12-month)
- [ ] Installment calculation
- [ ] Payment schedule generation
- [ ] Auto-charging logic
- [ ] Failed payment retry logic
- [ ] Installment status dashboard
- **Impact**: High | **Complexity**: High
- **What's needed**: 
  - Table: `installment_plans` and `installment_payments`
  - Scheduled payment processing
  - Recurring payment gateway integration
  - Payment failure handling

#### 5. SUBSCRIPTION / RECURRING PAYMENT FORMS
- [ ] Subscription plan configuration
- [ ] Billing interval setup (monthly, yearly, custom)
- [ ] Auto-renewal management
- [ ] Subscription cancellation workflow
- [ ] Dunning management (failed payment recovery)
- [ ] Subscription analytics (churn, MRR)
- **Impact**: High | **Complexity**: High
- **What's needed**: 
  - Table: `subscriptions` and `subscription_payments`
  - Cron job for recurring charges
  - Webhook handling for payment failures
  - Subscription management dashboard

#### 6. REFUND MANAGEMENT DASHBOARD
- [ ] Refund request initiation
- [ ] Partial refund support
- [ ] Refund status tracking
- [ ] Refund history
- [ ] Gateway-specific refund handling
- [ ] Refund reporting and analytics
- **Impact**: High | **Complexity**: Medium
- **What's needed**: 
  - Table: `refunds` with status pipeline
  - API endpoints for refund operations
  - Refund dashboard UI component
  - Integration with payment gateways for refund processing

#### 7. PAYMENT DISPUTE LOGGING
- [ ] Dispute registration interface
- [ ] Dispute status tracking (pending, resolved, lost)
- [ ] Dispute documentation/evidence upload
- [ ] Dispute timeline
- **Impact**: Medium | **Complexity**: Medium
- **What's needed**: 
  - Table: `payment_disputes`
  - Dispute management UI
  - Evidence upload/storage

#### 8. BANK TRANSFER / MANUAL PAYMENT OPTION
- [ ] Manual payment method configuration
- [ ] Bank account information display
- [ ] Payment verification checklist
- [ ] Manual approval workflow
- [ ] Payment confirmation email
- **Impact**: Medium | **Complexity**: Low
- **What's needed**: 
  - Payment method type in form settings
  - Manual verification UI
  - Email notification on payment received

#### 9. FREE + PAID TIER FORM
- [ ] Free tier access configuration
- [ ] Paid tier upgrade option
- [ ] Tier comparison display
- [ ] Conditional tier routing
- **Impact**: Medium | **Complexity**: Medium
- **What's needed**: 
  - Form-level tier configuration
  - Conditional logic for tier selection
  - Upgrade flow after form submission

#### 10. INVENTORY TRACKING
- [ ] Inventory level management per option
- [ ] Auto-disable when stock = 0
- [ ] Stock reservation on booking
- [ ] Inventory alerts
- **Impact**: High | **Complexity**: Medium
- **What's needed**: 
  - Table: `product_inventory` with stock levels
  - API for inventory updates
  - Form-level inventory checking
  - Out-of-stock field disabling

#### 11. TICKET GENERATION WITH QR CODE
- [ ] PDF ticket generation
- [ ] QR code embedding
- [ ] Ticket numbering/tracking
- [ ] Email delivery
- [ ] Unique ticket per attendee
- **Impact**: High | **Complexity**: Medium
- **What's needed**: 
  - PDF generation library integration (already have invoice)
  - QR code library
  - Table: `tickets` for tracking
  - Ticket delivery automation

#### 12. TICKET SCANNING / CHECK-IN APP
- [ ] QR code scanner UI
- [ ] Check-in status tracking
- [ ] Attendee list with check-in status
- [ ] Real-time check-in dashboard
- [ ] Mobile-optimized scanning interface
- **Impact**: Medium | **Complexity**: Medium
- **What's needed**: 
  - Check-in API endpoint
  - Mobile UI component for scanning
  - Real-time updates (WebSocket/polling)
  - Event attendee management

#### 13. WAITLIST MANAGEMENT
- [ ] Capacity threshold configuration
- [ ] Auto-add to waitlist when full
- [ ] Waitlist position tracking
- [ ] Notification when spot opens
- [ ] Waitlist conversion tracking
- **Impact**: Medium | **Complexity**: Medium
- **What's needed**: 
  - Table: `waitlist` entries
  - Capacity checking logic
  - Notification automation
  - Waitlist conversion workflow

### Product & Order Features (High Priority)

#### 14. PRODUCT VARIANTS (Size, Color, Quantity)
- [ ] Variant configuration UI
- [ ] Variant pricing (different prices per variant)
- [ ] Variant inventory tracking
- [ ] Variant selection display
- [ ] Multiple variant selection (e.g., size + color)
- **Impact**: High | **Complexity**: High
- **What's needed**: 
  - Table: `product_variants` and `variant_inventory`
  - Variant selection UI in form
  - Pricing calculation with variants
  - Inventory by variant

#### 15. PRODUCT CATALOG EMBEDDED IN FORM
- [ ] Product listing display in form
- [ ] Product images/descriptions
- [ ] Product categorization
- [ ] Product filtering/search
- [ ] Add to cart functionality
- **Impact**: High | **Complexity**: High
- **What's needed**: 
  - Table: `products` and `product_categories`
  - Product display component
  - Product management UI
  - Integration with cart system

#### 16. ORDER FORM WITH CUSTOM TOTALS
- [ ] Order line item management
- [ ] Automatic total calculation
- [ ] Discount application
- [ ] Shipping calculation
- [ ] Tax application
- [ ] Summary display
- **Impact**: High | **Complexity**: High
- **What's needed**: 
  - Enhanced cart component
  - Order calculation engine
  - Order summary display

#### 17. PAYOUT MANAGEMENT (Split Payments)
- [ ] Multi-account payout configuration
- [ ] Split percentage/amount setup
- [ ] Automatic payout scheduling
- [ ] Payout status tracking
- [ ] Settlement dashboard
- **Impact**: High | **Complexity**: High
- **What's needed**: 
  - Table: `payout_settings` and `payouts`
  - Payout calculation logic
  - Gateway payout API integration
  - Payout reconciliation

#### 18. ESCROW PAYMENT OPTION
- [ ] Escrow amount holding
- [ ] Release confirmation workflow
- [ ] Dispute resolution in escrow
- [ ] Automatic release after time period
- [ ] Escrow balance tracking
- **Impact**: Medium | **Complexity**: High
- **What's needed**: 
  - Escrow payment flow
  - Approval workflow
  - Integration with payment gateways
  - Release automation

#### 19. OFFLINE PAYMENT RECORDING
- [ ] Manual payment mark as paid
- [ ] Payment receipt upload
- [ ] Verification checklist
- [ ] Payment timestamp recording
- [ ] Notes/comments section
- **Impact**: Low | **Complexity**: Low
- **What's needed**: 
  - UI for manual payment marking
  - Status update API
  - Payment verification workflow

### Analytics & Reporting (Medium Priority)

#### 20. REVENUE ANALYTICS PER FORM
- [ ] Revenue total display
- [ ] Revenue trends chart
- [ ] Revenue per field/option
- [ ] Top revenue sources
- [ ] Average order value
- [ ] Conversion funnel (views → payments)
- **Impact**: High | **Complexity**: Medium
- **What's needed**: 
  - Enhanced form_analytics table
  - Revenue calculation queries
  - Revenue chart components
  - Export revenue reports

#### 21. PAYOUT MANAGEMENT ANALYTICS
- [ ] Payout history
- [ ] Payout schedule view
- [ ] Pending payouts display
- [ ] Payout reconciliation
- [ ] Transaction fees breakdown
- **Impact**: Medium | **Complexity**: Medium
- **What's needed**: 
  - Payout dashboard component
  - Payout status queries
  - Fee calculation display

---

## PART 3: FEATURE IMPLEMENTATION PRIORITY & ROADMAP

### Phase 1: Essential Payment Features (Weeks 1-2)
1. Promo codes / Discount codes
2. Inventory tracking with auto-disable
3. Refund management dashboard
4. Manual/Bank transfer payment option
5. Offline payment recording

### Phase 2: Advanced Commerce (Weeks 3-4)
1. Product variants and catalog
2. Installment payment plans
3. Subscription/recurring payments
4. Partial payment/deposit option
5. Free + paid tier forms

### Phase 3: Event & Booking (Weeks 5-6)
1. Ticket generation with QR code
2. Ticket scanning/check-in app
3. Waitlist management
4. Enhanced booking with notifications
5. Ticket delivery automation

### Phase 4: Enterprise Features (Weeks 7-8)
1. Payout management (split payments)
2. Escrow payment option
3. Payment dispute logging
4. Advanced revenue analytics
5. Donation/custom amount payments

---

## PART 4: DATABASE CHANGES NEEDED

### New Tables Required

```sql
-- Promo Codes & Discounts
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY,
  organization_id UUID,
  code VARCHAR(50) UNIQUE,
  discount_type ENUM('percentage', 'fixed'),
  discount_value DECIMAL(10, 2),
  currency VARCHAR(3),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  max_uses INTEGER,
  usage_count INTEGER DEFAULT 0,
  min_amount DECIMAL(10, 2),
  applicable_forms UUID[],
  is_active BOOLEAN DEFAULT TRUE
);

-- Inventory Management
CREATE TABLE product_inventory (
  id UUID PRIMARY KEY,
  form_id UUID,
  field_id VARCHAR(255),
  option_id VARCHAR(255),
  stock_level INTEGER,
  reserved_count INTEGER DEFAULT 0,
  low_stock_threshold INTEGER,
  is_disabled BOOLEAN DEFAULT FALSE
);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY,
  payment_id UUID,
  amount DECIMAL(10, 2),
  reason VARCHAR(255),
  status ENUM('pending', 'approved', 'processing', 'completed', 'failed'),
  gateway_refund_id VARCHAR(255),
  created_at TIMESTAMP,
  processed_at TIMESTAMP
);

-- Installment Plans
CREATE TABLE installment_plans (
  id UUID PRIMARY KEY,
  payment_id UUID,
  total_amount DECIMAL(10, 2),
  installment_count INTEGER,
  installment_amount DECIMAL(10, 2),
  interval_days INTEGER,
  status ENUM('active', 'completed', 'failed')
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  organization_id UUID,
  form_id UUID,
  response_id UUID,
  plan_id VARCHAR(255),
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  billing_interval ENUM('monthly', 'yearly', 'custom'),
  next_billing_date TIMESTAMP,
  status ENUM('active', 'cancelled', 'paused'),
  gateway_subscription_id VARCHAR(255)
);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  form_id UUID,
  field_id VARCHAR(255),
  variant_name VARCHAR(255),
  variant_value VARCHAR(255),
  price_modifier DECIMAL(10, 2),
  stock_level INTEGER
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  response_id UUID,
  ticket_number VARCHAR(50) UNIQUE,
  qr_code_data TEXT,
  check_in_status BOOLEAN DEFAULT FALSE,
  check_in_time TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE
);

-- Waitlist
CREATE TABLE waitlist (
  id UUID PRIMARY KEY,
  form_id UUID,
  field_id VARCHAR(255),
  respondent_email VARCHAR(255),
  position INTEGER,
  notified BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE
);

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY,
  organization_id UUID,
  total_amount DECIMAL(15, 2),
  currency VARCHAR(3),
  status ENUM('pending', 'processing', 'completed', 'failed'),
  gateway_payout_id VARCHAR(255),
  scheduled_date TIMESTAMP,
  completed_at TIMESTAMP
);

-- Payment Disputes
CREATE TABLE payment_disputes (
  id UUID PRIMARY KEY,
  payment_id UUID,
  dispute_reason VARCHAR(255),
  status ENUM('open', 'under_review', 'resolved', 'lost'),
  amount DECIMAL(10, 2),
  evidence_url VARCHAR(500),
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

---

## PART 5: MISSING API ENDPOINTS (To Be Created)

### Discount/Promo Management
- `POST /api/promo/validate` - Validate promo code
- `POST /api/promo/apply` - Apply discount to order
- `POST /api/promo/create` - Create promo code (admin)
- `GET /api/promo/list` - List promo codes (admin)

### Inventory Management
- `GET /api/inventory/check` - Check item availability
- `POST /api/inventory/reserve` - Reserve item
- `POST /api/inventory/release` - Release reservation
- `PUT /api/inventory/update` - Update stock level

### Refunds
- `POST /api/refunds/request` - Request refund
- `GET /api/refunds/list` - List refunds
- `PUT /api/refunds/{id}/approve` - Approve refund
- `POST /api/refunds/process` - Process refund (gateway integration)

### Installments
- `POST /api/installments/create` - Create installment plan
- `GET /api/installments/{id}` - Get plan details
- `POST /api/installments/{id}/charge` - Process next installment

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/{id}/cancel` - Cancel subscription
- `POST /api/subscriptions/{id}/pause` - Pause subscription
- `GET /api/subscriptions/upcoming` - Get upcoming charges

### Tickets
- `POST /api/tickets/generate` - Generate ticket with QR
- `GET /api/tickets/{id}` - Get ticket details
- `POST /api/tickets/{id}/checkin` - Check in attendee
- `GET /api/tickets/checkin/summary` - Check-in summary

### Waitlist
- `POST /api/waitlist/add` - Add to waitlist
- `GET /api/waitlist/list` - List waitlist (admin)
- `POST /api/waitlist/{id}/notify` - Notify waitlist member
- `POST /api/waitlist/{id}/convert` - Convert to booking

### Payouts
- `GET /api/payouts/summary` - Payout summary
- `GET /api/payouts/history` - Payout history
- `POST /api/payouts/schedule` - Schedule payout
- `GET /api/payouts/{id}/details` - Payout details

### Disputes
- `POST /api/disputes/create` - Create dispute
- `GET /api/disputes/list` - List disputes
- `PUT /api/disputes/{id}/status` - Update dispute status

---

## PART 6: MISSING FRONTEND COMPONENTS (To Be Created)

1. **promo-code-input.tsx** - Promo code input & validation UI
2. **discount-display.tsx** - Show applied discounts
3. **inventory-selector.tsx** - Stock-aware product selection
4. **refund-request-modal.tsx** - Request refund UI
5. **refund-dashboard.tsx** - Refund management dashboard
6. **installment-plan-selector.tsx** - Installment option display
7. **subscription-plan-selector.tsx** - Subscription plan chooser
8. **product-variant-selector.tsx** - Size, color, etc. selection
9. **product-catalog-display.tsx** - Product listing
10. **ticket-display.tsx** - Ticket with QR code
11. **checkin-scanner.tsx** - QR code scanner for check-in
12. **waitlist-manager.tsx** - Waitlist dashboard
13. **payout-dashboard.tsx** - Payout management UI
14. **dispute-form.tsx** - Dispute filing interface

---

## PART 7: ENVIRONMENT VARIABLES NEEDED

### Payment Gateway API Keys (Already Set)
```
PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
FLUTTERWAVE_PUBLIC_KEY
FLUTTERWAVE_SECRET_KEY
PAYPAL_CLIENT_ID
PAYPAL_SECRET
STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY
```

### Third-Party Services (Not Set)
```
TWILIO_ACCOUNT_SID (for SMS reminders)
TWILIO_AUTH_TOKEN
SENDGRID_API_KEY (for email automation)
AWS_S3_BUCKET (for ticket/evidence storage)
CLOUDINARY_API_KEY (for QR code generation)
```

---

## PART 8: SUMMARY & NEXT STEPS

### Current Implementation Status: **55-60%**

**What Works Well:**
- Core payment flow (initialize → verify)
- Dynamic pricing engine
- Booking system foundation
- Invoice generation
- Multi-currency support
- 4 payment gateways hooked up

**Critical Gaps:**
- Promo codes and discounts
- Installment/subscription payments
- Refund management
- Inventory tracking
- Ticket generation and check-in
- Waitlist management

**Immediate Action Items (Next Sprint):**
1. Add promo code validation and application
2. Implement inventory tracking with auto-disable
3. Create refund request and management UI
4. Add manual/bank transfer payment option
5. Implement ticket generation with QR code

**Timeline:**
- Phase 1 (Essential): 2 weeks
- Phase 2 (Advanced): 2 weeks
- Phase 3 (Event/Booking): 2 weeks
- Phase 4 (Enterprise): 2 weeks
- **Total: 8 weeks** to reach 95%+ feature parity

---

## DOCUMENT METADATA
- **Created**: May 19, 2026
- **Reviewed**: Comprehensive codebase audit
- **Status**: Ready for implementation
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React 19.2 + TypeScript
- **Backend**: Next.js 16 + TypeScript
