import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Handle Stripe webhooks
async function handleStripeWebhook(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error) {
    console.error('[v0] Stripe webhook signature verification failed:', error);
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        if (!session.metadata?.organization_id) {
          return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        // Update or insert user subscription
        await supabase
          .from('user_subscriptions')
          .upsert({
            organization_id: session.metadata.organization_id,
            plan_id: session.metadata.plan_id,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscription.id,
            status: 'active',
            billing_cycle: session.metadata.billing_cycle,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
            payment_provider: 'stripe',
            stripe_customer_email: session.customer_email,
          }, {
            onConflict: 'organization_id',
          });

        // Record in billing history
        await supabase
          .from('billing_history')
          .insert({
            organization_id: session.metadata.organization_id,
            transaction_type: 'subscription_charge',
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'completed',
            payment_provider: 'stripe',
            reference: session.id,
            metadata: {
              plan_id: session.metadata.plan_id,
              subscription_id: subscription.id,
            },
          });

        console.log('[v0] Subscription activated via Stripe:', session.metadata.organization_id);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        // Find organization by stripe subscription ID
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('organization_id, plan_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (userSub) {
          // Update subscription status
          await supabase
            .from('user_subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'canceled',
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000),
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log('[v0] Subscription updated via Stripe:', userSub.organization_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        // Find and update subscription
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (userSub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date(),
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log('[v0] Subscription deleted via Stripe:', userSub.organization_id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          await supabase
            .from('billing_history')
            .insert({
              organization_id: invoice.metadata?.organization_id || '',
              transaction_type: 'invoice_paid',
              amount: (invoice.amount_paid || 0) / 100,
              currency: invoice.currency?.toUpperCase() || 'USD',
              status: 'completed',
              payment_provider: 'stripe',
              reference: invoice.id,
              metadata: {
                subscription_id: invoice.subscription,
                invoice_number: invoice.number,
              },
            });

          console.log('[v0] Invoice paid via Stripe:', invoice.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          await supabase
            .from('billing_history')
            .insert({
              organization_id: invoice.metadata?.organization_id || '',
              transaction_type: 'invoice_failed',
              amount: (invoice.amount_due || 0) / 100,
              currency: invoice.currency?.toUpperCase() || 'USD',
              status: 'failed',
              payment_provider: 'stripe',
              reference: invoice.id,
              metadata: {
                subscription_id: invoice.subscription,
                error: invoice.last_payment_error?.message,
              },
            });

          console.log('[v0] Invoice payment failed via Stripe:', invoice.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[v0] Stripe webhook processing error:', error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle Paystack webhooks
async function handlePaystackWebhook(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';

  // Verify Paystack signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    console.error('[v0] Paystack webhook signature verification failed');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success': {
        const { reference, customer, authorization, metadata } = event.data;

        if (!metadata?.organization_id) {
          return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
        }

        // Update or insert subscription
        await supabase
          .from('user_subscriptions')
          .upsert({
            organization_id: metadata.organization_id,
            plan_id: metadata.plan_id,
            paystack_customer_code: customer.customer_code,
            paystack_authorization_code: authorization.authorization_code,
            status: 'active',
            billing_cycle: metadata.billing_cycle,
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + (metadata.billing_cycle === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
            payment_provider: 'paystack',
            paystack_customer_email: customer.email,
          }, {
            onConflict: 'organization_id',
          });

        // Record transaction
        await supabase
          .from('billing_history')
          .insert({
            organization_id: metadata.organization_id,
            transaction_type: 'subscription_charge',
            amount: (event.data.amount || 0) / 100,
            currency: 'NGN',
            status: 'completed',
            payment_provider: 'paystack',
            reference,
            metadata: {
              plan_id: metadata.plan_id,
              customer_code: customer.customer_code,
            },
          });

        console.log('[v0] Subscription activated via Paystack:', metadata.organization_id);
        break;
      }

      case 'charge.failed': {
        const { reference, metadata } = event.data;

        if (metadata?.organization_id) {
          await supabase
            .from('billing_history')
            .insert({
              organization_id: metadata.organization_id,
              transaction_type: 'subscription_charge',
              amount: (event.data.amount || 0) / 100,
              currency: 'NGN',
              status: 'failed',
              payment_provider: 'paystack',
              reference,
              metadata: {
                plan_id: metadata.plan_id,
                reason: event.data.failure_reason,
              },
            });

          console.log('[v0] Charge failed via Paystack:', metadata.organization_id);
        }
        break;
      }

      case 'subscription.disable': {
        const { customer, reference } = event.data;

        // Find and cancel subscription
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('organization_id')
          .eq('paystack_customer_code', customer.customer_code)
          .limit(1)
          .single();

        if (userSub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date(),
            })
            .eq('paystack_customer_code', customer.customer_code);

          console.log('[v0] Subscription disabled via Paystack:', userSub.organization_id);
        }
        break;
      }
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('[v0] Paystack webhook processing error:', error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Determine which webhook provider
    if (request.headers.get('stripe-signature')) {
      return await handleStripeWebhook(request);
    } else if (request.headers.get('x-paystack-signature')) {
      return await handlePaystackWebhook(request);
    } else {
      return NextResponse.json(
        { message: 'Unknown webhook provider' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[v0] Webhook processing error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
