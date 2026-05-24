import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

async function getPaypalAccessToken(clientId: string, clientSecret: string) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'PayPal authentication failed');
  return data.access_token as string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, currency = 'USD', orderId, returnUrl, cancelUrl, clientId, clientSecret } = body;
    const paypalClientId = clientId || process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = clientSecret || process.env.PAYPAL_CLIENT_SECRET;

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json({ message: 'PayPal configuration missing' }, { status: 500 });
    }

    const accessToken = await getPaypalAccessToken(paypalClientId, paypalClientSecret);

    if (action === 'initialize') {
      if (!amount) {
        return NextResponse.json({ message: 'Amount is required' }, { status: 400 });
      }

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{ amount: { currency_code: currency, value: String(amount) } }],
          application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (action === 'capture') {
      if (!orderId) {
        return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
      }

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[v0] PayPal error:', error);
    return NextResponse.json({ message: error.message || 'PayPal gateway error' }, { status: 500 });
  }
}
