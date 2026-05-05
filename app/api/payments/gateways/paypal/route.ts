import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, currency, returnUrl, cancelUrl } = body;
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { message: 'PayPal configuration missing' },
        { status: 500 }
      );
    }

    // Get access token
    const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (action === 'create_order') {
      if (!amount) {
        return NextResponse.json(
          { message: 'Amount is required' },
          { status: 400 }
        );
      }

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency || 'NGN',
                value: amount.toString(),
              },
            },
          ],
          application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
            brand_name: 'Your Store',
            locale: 'en-US',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
          },
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (action === 'capture_order') {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json(
          { message: 'Order ID is required' },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[v0] PayPal error:', error);
    return NextResponse.json(
      { message: error.message || 'Payment gateway error' },
      { status: 500 }
    );
  }
}
