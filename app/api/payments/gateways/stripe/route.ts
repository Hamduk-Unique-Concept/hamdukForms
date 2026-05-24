import { NextRequest, NextResponse } from 'next/server';

const STRIPE_BASE_URL = 'https://api.stripe.com/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      amount,
      currency = 'usd',
      email,
      reference,
      successUrl,
      cancelUrl,
      secretKey,
    } = body;
    const stripeSecretKey = secretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({ message: 'Stripe configuration missing' }, { status: 500 });
    }

    if (action === 'initialize') {
      if (!amount || !email || !successUrl || !cancelUrl) {
        return NextResponse.json(
          { message: 'Amount, email, successUrl, and cancelUrl are required' },
          { status: 400 }
        );
      }

      const params = new URLSearchParams();
      params.set('mode', 'payment');
      params.set('customer_email', email);
      params.set('success_url', successUrl);
      params.set('cancel_url', cancelUrl);
      params.set('line_items[0][price_data][currency]', currency.toLowerCase());
      params.set('line_items[0][price_data][product_data][name]', 'Form payment');
      params.set('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)));
      params.set('line_items[0][quantity]', '1');
      if (reference) params.set('client_reference_id', reference);

      const response = await fetch(`${STRIPE_BASE_URL}/checkout/sessions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (action === 'verify') {
      if (!reference) {
        return NextResponse.json({ message: 'Session ID is required' }, { status: 400 });
      }

      const response = await fetch(`${STRIPE_BASE_URL}/checkout/sessions/${reference}`, {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[v0] Stripe form-payment error:', error);
    return NextResponse.json({ message: error.message || 'Stripe gateway error' }, { status: 500 });
  }
}
