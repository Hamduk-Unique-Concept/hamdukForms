import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, email, reference, accessCode } = body;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { message: 'Paystack configuration missing' },
        { status: 500 }
      );
    }

    if (action === 'initialize') {
      if (!amount || !email) {
        return NextResponse.json(
          { message: 'Amount and email are required' },
          { status: 400 }
        );
      }

      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to kobo
          email,
          metadata: {
            custom_fields: [],
          },
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (action === 'verify') {
      if (!reference) {
        return NextResponse.json(
          { message: 'Reference is required' },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
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
    console.error('[v0] Paystack error:', error);
    return NextResponse.json(
      { message: error.message || 'Payment gateway error' },
      { status: 500 }
    );
  }
}
