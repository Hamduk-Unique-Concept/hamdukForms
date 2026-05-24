import { NextRequest, NextResponse } from 'next/server';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, currency = 'NGN', email, reference, redirectUrl, secretKey } = body;
    const flutterwaveSecretKey = secretKey || process.env.FLUTTERWAVE_SECRET_KEY;

    if (!flutterwaveSecretKey) {
      return NextResponse.json({ message: 'Flutterwave configuration missing' }, { status: 500 });
    }

    if (action === 'initialize') {
      if (!amount || !email) {
        return NextResponse.json({ message: 'Amount and email are required' }, { status: 400 });
      }

      const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: reference || `hamduk-form-${Date.now()}`,
          amount,
          currency,
          redirect_url: redirectUrl,
          customer: { email },
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (action === 'verify') {
      if (!reference) {
        return NextResponse.json({ message: 'Reference is required' }, { status: 400 });
      }

      const response = await fetch(`${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${reference}`, {
        headers: { Authorization: `Bearer ${flutterwaveSecretKey}` },
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[v0] Flutterwave error:', error);
    return NextResponse.json({ message: error.message || 'Flutterwave gateway error' }, { status: 500 });
  }
}
