import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export type StripeCheckoutSessionMetadata = {
  organizationId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
};

export type StripeWebhookEvent = 'checkout.session.completed' | 'customer.subscription.updated' | 'customer.subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed';
