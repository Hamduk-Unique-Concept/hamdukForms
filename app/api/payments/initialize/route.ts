import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { checkoutId, amount } = await request.json();

    if (!checkoutId || !amount) {
      return NextResponse.json(
        { message: 'Missing checkoutId or amount' },
        { status: 400 }
      );
    }

    // Verify Paystack credentials
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('[v0] PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { message: 'Payment provider not configured' },
        { status: 500 }
      );
    }

    // Get checkout session details
    const { data: checkoutSession, error: checkoutError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', checkoutId)
      .single();

    if (checkoutError || !checkoutSession) {
      return NextResponse.json({ message: 'Checkout session not found' }, { status: 404 });
    }

    console.log('[v0] Initializing Paystack payment for:', checkoutSession.email);

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: checkoutSession.email,
        amount: Math.round(amount * 100), // Paystack expects amount in kobo
        metadata: {
          checkoutId,
          organizationId: checkoutSession.organization_id,
          planId: checkoutSession.plan_id,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('[v0] Paystack error:', paystackData);
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    console.log('[v0] Paystack initialized:', paystackData.data.reference);

    // Update checkout session with Paystack reference
    await supabase
      .from('checkout_sessions')
      .update({
        paystack_reference: paystackData.data.reference,
        status: 'payment_initiated',
      })
      .eq('id', checkoutId);

    return NextResponse.json(
      {
        message: 'Payment initialized',
        authorizationUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Payment initialization error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
