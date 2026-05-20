import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2024-04-10',
    });
  }
  return stripeInstance;
}

// Keep export for backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return (getStripe() as any)[prop];
  },
});

export type StripeCheckoutSessionMetadata = {
  organizationId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
};

export type StripeWebhookEvent = 'checkout.session.completed' | 'customer.subscription.updated' | 'customer.subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed';
